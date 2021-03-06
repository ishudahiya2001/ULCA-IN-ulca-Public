package com.ulca.model.service;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLException;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ulca.benchmark.util.FileUtility;
import com.ulca.model.exception.ModelComputeException;
import com.ulca.model.request.Input;
import com.ulca.model.request.ModelComputeRequest;
import com.ulca.model.response.ModelComputeResponse;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import io.swagger.model.ASRRequest;
import io.swagger.model.ASRResponse;
import io.swagger.model.ImageFile;
import io.swagger.model.ImageFiles;
import io.swagger.model.OCRRequest;
import io.swagger.model.OCRResponse;
import io.swagger.model.OneOfInferenceAPIEndPointSchema;
import io.swagger.model.Sentence;
import io.swagger.model.Sentences;
import io.swagger.model.TTSConfig;
import io.swagger.model.TTSRequest;
import io.swagger.model.TTSResponse;
import io.swagger.model.TranslationRequest;
import io.swagger.model.TranslationResponse;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.io.IOException;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;


@Slf4j
@Service
public class ModelInferenceEndPointService {

	@Autowired
	WebClient.Builder builder;
	
	@Value("${ulca.model.upload.folder}")
	private String modelUploadFolder;
	
	@Autowired
	FileUtility fileUtility;

	public OneOfInferenceAPIEndPointSchema validateCallBackUrl(String callBackUrl,
			OneOfInferenceAPIEndPointSchema schema)
			throws URISyntaxException, IOException, KeyManagementException, NoSuchAlgorithmException {

		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TranslationInference")) {
			io.swagger.model.TranslationInference translationInference = (io.swagger.model.TranslationInference) schema;
			TranslationRequest request = translationInference.getRequest();
			
			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			//OkHttpClient client = new OkHttpClient();
			OkHttpClient client = new OkHttpClient.Builder()
				      .readTimeout(60, TimeUnit.SECONDS)
				      .build();
			
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();
			
			TranslationResponse response = objectMapper.readValue(responseJsonStr, TranslationResponse.class);
			translationInference.setResponse(response);
			schema = translationInference;

		}

		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.ASRInference")) {
			io.swagger.model.ASRInference asrInference = (io.swagger.model.ASRInference) schema;
			ASRRequest request = asrInference.getRequest();

			ASRResponse response  = null;
			SslContext sslContext;
			try {
				sslContext = SslContextBuilder
				        .forClient()
				        .trustManager(InsecureTrustManagerFactory.INSTANCE)
				        .build();
				
				 HttpClient httpClient = HttpClient.create().secure(t -> t.sslContext(sslContext));
				 
				 response = builder.clientConnector(new ReactorClientHttpConnector(httpClient)).build().post().uri(callBackUrl)
							.body(Mono.just(request), ASRRequest.class).retrieve().bodyToMono(ASRResponse.class)
							.block(); 
				 
			} catch (SSLException e) {
				e.printStackTrace();
			}

			ObjectMapper objectMapper = new ObjectMapper();
			log.info("logging asr inference point response"  + objectMapper.writeValueAsString(response));
			asrInference.setResponse(response);
			schema = asrInference;

		}
		
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.OCRInference")) {
			io.swagger.model.OCRInference ocrInference = (io.swagger.model.OCRInference) schema;
			OCRRequest request = ocrInference.getRequest();

			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			//OkHttpClient client = new OkHttpClient();
			OkHttpClient client = new OkHttpClient.Builder()
				      .readTimeout(60, TimeUnit.SECONDS)
				      .build();
			
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();
			OCRResponse response = objectMapper.readValue(responseJsonStr, OCRResponse.class);
			ocrInference.setResponse(response);
			schema = ocrInference;

			log.info("logging ocr inference point response" + responseJsonStr);
		}
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TTSInference")) {
			io.swagger.model.TTSInference ttsInference = (io.swagger.model.TTSInference) schema;
			TTSRequest request = ttsInference.getRequest();

			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			//OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			OkHttpClient newClient = getTrustAllCertsClient();
			
			
			Response httpResponse = newClient.newCall(httpRequest).execute();
			
			//Response httpResponse = client.newCall(httpRequest).execute();
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();
			TTSResponse response = objectMapper.readValue(responseJsonStr, TTSResponse.class);
			ttsInference.setResponse(response);
			schema = ttsInference;

			log.info("logging tts inference point response" + responseJsonStr);
		}
		
		return schema;

	}

	public ModelComputeResponse compute(String callBackUrl, OneOfInferenceAPIEndPointSchema schema,
			ModelComputeRequest compute)
			throws URISyntaxException, IOException, KeyManagementException, NoSuchAlgorithmException {

		ModelComputeResponse response = new ModelComputeResponse();

		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TranslationInference")) {
			io.swagger.model.TranslationInference translationInference = (io.swagger.model.TranslationInference) schema;
			TranslationRequest request = translationInference.getRequest();

			List<Input> input = compute.getInput();
			Sentences sentences = new Sentences();
			for (Input ip : input) {
				Sentence sentense = new Sentence();
				sentense.setSource(ip.getSource());
				sentences.add(sentense);
			}
			request.setInput(sentences);
			
			
			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			if (httpResponse.code() < 200 || httpResponse.code() > 204) {

				log.info(httpResponse.toString());
				
				throw new ModelComputeException(httpResponse.message(), "Translation Model Compute Failed",  HttpStatus.valueOf(httpResponse.code()));
			}
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();

			TranslationResponse translation = objectMapper.readValue(responseJsonStr, TranslationResponse.class);

			if(translation.getOutput() == null || translation.getOutput().size() <= 0 || translation.getOutput().get(0).getTarget().isBlank()) {
				throw new ModelComputeException( httpResponse.message(),"Translation Model Compute Response is Empty", HttpStatus.BAD_REQUEST);
				
			}
			
			response.setOutputText(translation.getOutput().get(0).getTarget());
			
			return response;
		}
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.OCRInference")) {
			io.swagger.model.OCRInference ocrInference = (io.swagger.model.OCRInference) schema;
			
			
			ImageFiles imageFiles = new ImageFiles();
			ImageFile imageFile = new ImageFile();
			imageFile.setImageUri(compute.getImageUri());
			imageFiles.add(imageFile);
			
			
			OCRRequest request = ocrInference.getRequest();
			request.setImage(imageFiles);

			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			if (httpResponse.code() < 200 || httpResponse.code() > 204) {

				log.info(httpResponse.toString());
				
				throw new ModelComputeException(httpResponse.message(), "OCR Model Compute Failed",  HttpStatus.valueOf(httpResponse.code()));
			}
			
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			OCRResponse ocrResponse  = objectMapper.readValue(httpResponse.body().string(), OCRResponse.class);
			
			if(ocrResponse.getOutput() == null || ocrResponse.getOutput().size() <=0 || ocrResponse.getOutput().get(0).getSource().isBlank()) {
				throw new ModelComputeException(httpResponse.message(), "OCR Model Compute Response is Empty",  HttpStatus.BAD_REQUEST);
				
			}
				
			response.setOutputText(ocrResponse.getOutput().get(0).getSource());
			
		}
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TTSInference")) {
			io.swagger.model.TTSInference ttsInference = (io.swagger.model.TTSInference) schema;
			
			
			TTSRequest request = ttsInference.getRequest();
			
			List<Input> input = compute.getInput();
			Sentences sentences = new Sentences();
			for (Input ip : input) {
				Sentence sentense = new Sentence();
				sentense.setSource(ip.getSource());
				sentences.add(sentense);
			}
			request.setInput(sentences);
			TTSConfig config = request.getConfig();
			config.setGender(compute.getGender());
			request.setConfig(config);
			
			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			//OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			OkHttpClient newClient = getTrustAllCertsClient();
			Response httpResponse = newClient.newCall(httpRequest).execute();
			
			//Response httpResponse = client.newCall(httpRequest).execute();
			if (httpResponse.code() < 200 || httpResponse.code() > 204) {

				log.info(httpResponse.toString());
				
				throw new ModelComputeException( httpResponse.message(), "TTS Model Compute Failed", HttpStatus.valueOf(httpResponse.code()));
			}
			
			String ttsResponseStr = httpResponse.body().string(); 
			
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			TTSResponse ttsResponse  = objectMapper.readValue(ttsResponseStr, TTSResponse.class);
			
			if(ttsResponse.getAudio() == null || ttsResponse.getAudio().size() <=0 ) {
				throw new ModelComputeException(httpResponse.message(), "TTS Model Compute Response is Empty",  HttpStatus.BAD_REQUEST);
				
			}
			if(ttsResponse.getAudio().get(0).getAudioContent() != null) {
				String encodedString = Base64.getEncoder().encodeToString(ttsResponse.getAudio().get(0).getAudioContent());
				response.setOutputText(encodedString);
			}else if(!ttsResponse.getAudio().get(0).getAudioUri().isBlank()){
				String audioUrl = ttsResponse.getAudio().get(0).getAudioUri();
				try {
					String fileName = UUID.randomUUID().toString();
					String uploadFolder = modelUploadFolder + "/model";
					String filePath = fileUtility.downloadUsingNIO(audioUrl, uploadFolder, fileName);
					byte[] bytes = FileUtils.readFileToByteArray(new File(filePath));
					String encodedString = Base64.getEncoder().encodeToString(bytes);
					response.setOutputText(encodedString);
					
					//delete the downloaded file
					FileUtils.delete(new File(filePath));
				}catch(Exception ex) {
					ex.printStackTrace();
					throw new ModelComputeException(ex.getMessage(), "TTS Output file not available",  HttpStatus.BAD_REQUEST);
				}
				
			}else {
				throw new ModelComputeException(httpResponse.message(), "TTS Model Compute Response is Empty", HttpStatus.BAD_REQUEST);
				
			}
			
		}
		
		
		return response;
	}
	
	public ModelComputeResponse compute(String callBackUrl, OneOfInferenceAPIEndPointSchema schema,
			String  imagePath)
			throws URISyntaxException, IOException {

		ModelComputeResponse response = new ModelComputeResponse();
		
		io.swagger.model.OCRInference ocrInference = (io.swagger.model.OCRInference) schema;
		
		byte[] bytes = FileUtils.readFileToByteArray(new File(imagePath));
		
		ImageFile imageFile = new ImageFile();
		imageFile.setImageContent(bytes);
		
		ImageFiles imageFiles = new ImageFiles();
		imageFiles.add(imageFile);
		
		OCRRequest request = ocrInference.getRequest();
		request.setImage(imageFiles);

		ObjectMapper objectMapper = new ObjectMapper();
		String requestJson = objectMapper.writeValueAsString(request);
		
		OkHttpClient client = new OkHttpClient();
		RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
		Request httpRequest = new Request.Builder()
		        .url(callBackUrl)
		        .post(body)
		        .build();
		
		Response httpResponse = client.newCall(httpRequest).execute();
		String responseJsonStr = httpResponse.body().string();
		
		OCRResponse ocrResponse  = objectMapper.readValue(responseJsonStr, OCRResponse.class);
		if(ocrResponse != null && ocrResponse.getOutput() != null && ocrResponse.getOutput().size() > 0) {
			response.setOutputText(ocrResponse.getOutput().get(0).getSource());
		}else {
			log.info("Ocr try me response is null or not proper" );
			log.info("callBackUrl :: " + callBackUrl);
			log.info("Request Json :: " + requestJson);
			log.info("ResponseJson :: " + responseJsonStr);
			
		}
		

		FileUtils.delete(new File(imagePath));
		
		return response;
	}
	
	public static OkHttpClient getTrustAllCertsClient() throws NoSuchAlgorithmException, KeyManagementException {
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                @Override
                public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
                }

                @Override
                public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
                }

                @Override
                public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                    return new java.security.cert.X509Certificate[]{};
                }
            }
        };

        SSLContext sslContext = SSLContext.getInstance("SSL");
        sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

        
        OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
        newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
        newBuilder.hostnameVerifier((hostname, session) -> true);
        return newBuilder.readTimeout(60, TimeUnit.SECONDS).build();
    }

}
