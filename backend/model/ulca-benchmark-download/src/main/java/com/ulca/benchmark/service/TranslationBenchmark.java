package com.ulca.benchmark.service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.ulca.benchmark.request.ExecuteBenchmarkRequest;
import com.ulca.model.dao.ModelExtended;

import io.swagger.model.Benchmark;
import io.swagger.model.InferenceAPIEndPoint;
import io.swagger.model.OneOfInferenceAPIEndPointSchema;
import io.swagger.model.Sentence;
import io.swagger.model.Sentences;
import io.swagger.model.TranslationRequest;
import io.swagger.model.TranslationResponse;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class TranslationBenchmark {

	@Autowired
	private KafkaTemplate<String, String> benchmarkMetricKafkaTemplate;
	
	@Value("${kafka.ulca.bm.metric.ip.topic}")
	private String mbMetricTopic;
	
	
	@Autowired
	WebClient.Builder builder;

	

	public TranslationResponse compute(String callBackUrl, OneOfInferenceAPIEndPointSchema schema,
			List<String> sourceSentences)
			throws MalformedURLException, URISyntaxException, JsonMappingException, JsonProcessingException {

		log.info("calling the inference end point");
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TranslationInference")) {
			io.swagger.model.TranslationInference translationInference = (io.swagger.model.TranslationInference) schema;
			TranslationRequest request = translationInference.getRequest();

			
			Sentences sentences = new Sentences();
			for (String ip : sourceSentences) {
				Sentence sentense = new Sentence();
				sentense.setSource(ip);
				sentences.add(sentense);
			}
			request.setInput(sentences);

			String responseStr = builder.build().post().uri(callBackUrl)
					.body(Mono.just(request), TranslationRequest.class).retrieve().bodyToMono(String.class).block();

			ObjectMapper objectMapper = new ObjectMapper();

			TranslationResponse translation = objectMapper.readValue(responseStr, TranslationResponse.class);
			
			return translation;
			
		}
		return null;
		
	}
	
	public void prepareAndPushToMetric(ModelExtended model, Benchmark benchmark, Map<String,String> fileMap, String metric, String benchmarkingProcessId) throws IOException, URISyntaxException {
		
		InferenceAPIEndPoint inferenceAPIEndPoint = model.getInferenceEndPoint();
		String callBackUrl = inferenceAPIEndPoint.getCallbackUrl();
		OneOfInferenceAPIEndPointSchema schema = inferenceAPIEndPoint.getSchema();
		
		String dataFilePath = fileMap.get("baseLocation")  + File.separator + "data.json";
		log.info("data.json file path :: " + dataFilePath);
		
		InputStream inputStream = Files.newInputStream(Path.of(dataFilePath));
		JsonReader reader = new JsonReader(new InputStreamReader(inputStream));
		reader.beginArray();
		
		
		List<String> ip = new ArrayList<String>();
		List<String> tgtList = new ArrayList<String>();
		
		while (reader.hasNext()) {
			
			Object rowObj = new Gson().fromJson(reader, Object.class);
			ObjectMapper mapper = new ObjectMapper();
			String dataRow = mapper.writeValueAsString(rowObj);
			
			log.info("dataRow :: " + dataRow);
			
			JSONObject inputJson =  new JSONObject(dataRow);
			
			String input = inputJson.getString("sourceText");
			
			String targetText = inputJson.getString("targetText");
			
			
			ip.add(input);
			tgtList.add(targetText);
			
		}
		reader.endArray();
		reader.close();
		inputStream.close();
		
		TranslationResponse translation = compute(callBackUrl, schema,ip );
		Sentences sentenses = translation.getOutput();
		JSONArray corpus = new JSONArray();
		int size = tgtList.size();
		for(int i = 0; i< size; i++) {
			Sentence sentense = sentenses.get(i);
            JSONObject target =  new JSONObject();
			target.put("tgt", tgtList.get(i));
			target.put("mtgt", sentense.getTarget());
			corpus.put(target);
		}
		
		JSONObject benchmarkDatasets  = new JSONObject();
		benchmarkDatasets.put("datasetId", benchmark.getBenchmarkId());
		benchmarkDatasets.put("metric", metric);
		benchmarkDatasets.put("corpus", corpus);
        	
		JSONObject metricRequest  = new JSONObject();
		metricRequest.put("benchmarkingProcessId", benchmarkingProcessId);
		metricRequest.put("modelId", model.getModelId());
		metricRequest.put("modelTaskType", model.getTask().getType().toString());
		metricRequest.put("benchmarkDatasets",benchmarkDatasets);
		
		log.info("data before sending to metric");
		log.info(metricRequest.toString());
		
		benchmarkMetricKafkaTemplate.send(mbMetricTopic,metricRequest.toString());
		
		
	}

}