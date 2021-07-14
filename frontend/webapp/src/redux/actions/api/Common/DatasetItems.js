import API from "../../api";
import C from "../../constants";
import ENDPOINTS from "../../../../configs/apiendpoints";
import CONFIGS from "../../../../configs/configs";

export default class DatasetItems extends API {
    constructor(timeout = 200000) {
        super("GET", timeout, false);
        this.type = C.GET_DATASET_ITEMS;
        this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.getDatasetItems}`;
    }

    toString() {
        return `${super.toString()} email: ${this.email} token: ${this.token} expires: ${this.expires} userid: ${this.userid}, type: ${this.type}`;
    }

    processResponse(res) {
        super.processResponse(res);
        this.report = res
    }

    apiEndPoint() {
        return this.endpoint;
    }


    getHeaders() {
        this.headers = {
            headers: {
                "Content-Type":'application/json'
            }
        };
        return this.headers;
    }

    getPayload() {
        return this.report
    }

}
