import C from "../../../actions/constants";

const initialState = {
  task: [],
  targetLanguage: [],
  metric: [],
  sourceLanguage: [],
  benchmarkDataset: {},
};

const updateBenchmarkDataset = (payload) => {
  let newPayload = Object.assign({}, JSON.parse(JSON.stringify(payload)));
  let keysArr = Object.keys(payload.benchmarkDataset);
  let valuesArr = Object.values(payload.benchmarkDataset);
  valuesArr.forEach((val, i) => {
    newPayload.benchmarkDataset[keysArr[i]] = payload.benchmarkDataset[
      keysArr[i]
    ].map((benchmark) => {
      return {
        value: benchmark.benchmarkId,
        label: benchmark.name,
      };
    });
  });
  return newPayload;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case C.SEARCH_MODEL_FILTER:
      return {
        ...state,
        ...updateBenchmarkDataset(action.payload),
      };
    default:
      return {
        ...state,
      };
  }
};

export default reducer;
