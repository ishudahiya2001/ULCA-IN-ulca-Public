package com.ulca.dataset.kakfa;


import io.swagger.model.DatasetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileDownload {
	
	private String userId;
	private String fileUrl;
	private String datasetId;
	private String serviceRequestNumber;
	private DatasetType datasetType;

}
