/**
 * Model Filter Search API
 */
 import API from "../../../api";
 import C from "../../../constants";
 import ENDPOINTS from "../../../../../configs/apiendpoints";
 
 export default class SearchModelFilter extends API {
     constructor(timeout = 2000) {
         super("GET", timeout, false);
         this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.searchModelFilter}`;
         this.type = C.SEARCH_MODEL_FILTER;
     }
 
     toString() {
         return `${super.toString()} email: ${this.email} token: ${this.token} expires: ${this.expires} userid: ${this.userid}, type: ${this.type}`;
     }
 
 
 
     processResponse(res) {
         super.processResponse(res);
         if (res) {
             this.report = res;
         }
     }
 
     apiEndPoint() {
         return this.endpoint;
     }
 
     getBody() {
        return {}
     }
 
 
     getHeaders() {
         this.headers = {
             headers: {
                 "Content-Type": "application/json",
 
             }
         };
         return this.headers;
     }
 
 
     getPayload() {
         return this.report;
 
     }
 }
 