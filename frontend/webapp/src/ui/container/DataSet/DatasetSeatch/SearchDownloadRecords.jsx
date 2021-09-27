import {
  Grid,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
} from "@material-ui/core";
import DownIcon from "@material-ui/icons/ArrowDropDown";
import SearchResult from "./SearchResult";
import { withStyles } from "@material-ui/core/styles";
import DatasetStyle from "../../../styles/Dataset";
import Snackbar from "../../../components/common/Snackbar";
import BreadCrum from "../../../components/common/Breadcrum";
import UrlConfig from "../../../../configs/internalurlmapping";
import { PageChange } from "../../../../redux/actions/api/DataSet/DatasetView/DatasetAction";
import C from "../../../../redux/actions/constants";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import DownloadDatasetRecords from "./DownloadDatasetRecords";
import RequestNumberCreation from "./RequestNumberCreation";
import { useHistory, useParams } from "react-router";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MultiAutocomplete from "../../../components/common/Autocomplete";
import { FilterBy } from "../../../../configs/DatasetItems";
import SubmitSearchRequest from "../../../../redux/actions/api/DataSet/DatasetSearch/SubmitSearchRequest";
// import DatasetType from '../../../../configs/DatasetItems';
import getLanguageLabel from "../../../../utils/getLabel";
import SearchAndDownloadAPI from "../../../../redux/actions/api/DataSet/DatasetSearch/SearchAndDownload";
import APITransport from "../../../../redux/actions/apitransport/apitransport";
import AdvanceFilter from "../../../components/common/AdvanceFilter";
import {
  getFilter,
  getFilterCategory,
} from "../../../../redux/actions/api/DataSet/DatasetSearch/GetFilters";
import SingleAutoComplete from "../../../components/common/SingleAutoComplete";

const StyledMenu = withStyles({})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "",
    }}
    {...props}
  />
));
const SearchAndDownloadRecords = (props) => {
  const { classes } = props;
  const url = UrlConfig.dataset;
  const urlMySearch = UrlConfig.mySearches;

  const [datasetType, setDatasetType] = useState({
    "parallel-corpus": true,
  });
  const DatasetType = useSelector(
    (state) => state.mySearchOptions.result.datasetType
  );
  const Language = useSelector(
    (state) => state.mySearchOptions.result.languagePair.sourceLang
  );
  const basicFilter = useSelector(
    (state) => state.mySearchOptions.result.basicFilter
  );
  const advFilter = useSelector(
    (state) => state.mySearchOptions.result.advFilter
  );
  // const basicFilterCategory = useSelector(state => state.mySearchOptions.filterCategory[Object.keys(datasetType)[0]].basicFilters);
  // const advanceFilterCategory = useSelector(state => state.mySearchOptions.filterCategory[Object.keys(datasetType)[0]].advancedFilters);

  const dispatch = useDispatch();
  const param = useParams();
  const history = useHistory();
  const { params, srno } = param;
  const [open, setOpen] = useState(false);
  const [advFilterState, setAdvFilterState] = useState({});
  const [basicFilterState, setBasicFilterState] = useState({});
  const [languagePair, setLanguagePair] = useState({
    source: "",
    target: [],
  });

  const [filterBy, setFilterBy] = useState({
    domain: "",
    source: "",
    collectionMethod: "",
  });

  const [count, setCount] = useState(0);
  const [urls, setUrls] = useState({
    downloadSample: "",
    downloadAll: "",
  });

  const previousUrl = useRef();

  const detailedReport = useSelector((state) => state.mySearchReport);
  let data = detailedReport.responseData.filter((val) => {
    return val.sr_no === srno;
  });

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/ULCA-IN/ulca/develop/master-data/dev/filterClassification.json",
      {
        method: "get",
      }
    )
      .then(async (res) => {
        let rsp_data = await res.json();
        if (res.ok) {
          dispatch(getFilterCategory(rsp_data, Object.keys(datasetType)[0]));
          const apiData = new SearchAndDownloadAPI();
          dispatch(APITransport(apiData));
        }
      })
      .catch((err) => {
        console.log(err);
      });
    previousUrl.current = params;

    if (data[0]) {
      const { searchValues } = data[0];
      setCount(data[0].count);
      setUrls({
        downloadSample: data[0].sampleUrl,
        downloadAll: data[0].downloadUrl,
      });

      let target = data[0].searchValues.targetLanguage
        ? getLanguageLabel(data[0].searchValues.targetLanguage)
        : getLanguageLabel(data[0].searchValues.sourceLanguage);
      let source =
        data[0].searchValues.sourceLanguage &&
        getLanguageLabel(data[0].searchValues.sourceLanguage)[0];
      let domain =
        data[0].searchValues.domain &&
        FilterBy.domain.filter(
          (val) => val.value === data[0].searchValues.domain[0]
        )[0];
      let collectionSource = searchValues.collectionSource;
      // let collectionMethod = data[0].collection && FilterBy.collectionMethod.filter(val => val.value === data[0].collection[0])[0].label
      // let label = data[0].search_criteria && data[0].search_criteria.split('|')[0]
      setBasicFilterState({
        ...basicFilterState,
        domain,
        collectionSource: { value: collectionSource },
      });
      setLanguagePair({ target, source });

      setFilterState(searchValues);

      //   setLanguagePair({ target, source: getLanguageLabel(data[0].sourceLanguage)})
      setDatasetType({ [data[0].searchValues.datasetType]: true });

      setLabel(label);
    } else if (
      (params === "completed" || params === "inprogress") &&
      count === 0
    )
      history.push(
        `${process.env.PUBLIC_URL}/search-and-download-rec/initiate/-1`
      );
  }, []);

  useEffect(() => {
    const searchValues =
      data.length && data[0].hasOwnProperty("searchValues")
        ? data[0]["searchValues"]
        : {};
    const searchKeys = Object.keys(searchValues);
    setOpen(hasAdvFilter(searchKeys));
  }, []);

  const hasAdvFilter = (searchKeys) => {
    for (let i = 0; i < advFilter.length; i++) {
      if (searchKeys.indexOf(advFilter[i].value) > -1) {
        return true;
      }
    }
    return false;
  };

  const getFilterInfo = (key, searchValue) => {
    let result = {};
    advFilter.forEach((filter) => {
      if (filter.value === key) {
        if (Array.isArray(searchValue)) {
          filter.values.forEach((value) => {
            if (Array.isArray(searchValue) && value.value === searchValue[0]) {
              result = {
                ...value,
                type: "array",
              };
            }
          });
        } else {
          result = {
            value: searchValue,
            type: "text",
          };
        }
      }
    });
    return result;
  };
  const setFilterState = (searchValues) => {
    const searchKeys = Object.keys(searchValues);
    const updatedFilterState = {};
    advFilter.forEach((filter) => {
      if (searchKeys.indexOf(filter.value) > -1) {
        updatedFilterState[filter.value] = getFilterInfo(
          filter.value,
          searchValues[filter.value]
        );
      }
    });
    setAdvFilterState({
      ...advFilterState,
      ...updatedFilterState,
    });
  };

  // useEffect(()=>{
  //     if(DatasetType.length){
  //         dispatch(getFilter('parallel-corpus'))
  //     }
  // },[DatasetType])

  useEffect(() => {
    if (previousUrl.current !== params && previousUrl.current !== "initiate") {
      setLanguagePair({ target: [], source: "" });
      clearfilter();
      setLabel("Parallel Dataset");
      setDatasetType({ "parallel-corpus": true });
    }
    previousUrl.current = params;
  });

  const handleCheckboxChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };
  const handleLanguagePairChange = (value, property) => {
    setLanguagePair({ ...languagePair, [property]: value });

    if (property === "source") setSrcError(false);
    else setTgtError(false);
  };
  const handleFilterByChange = (value, property) => {
    setFilterBy({ ...filterBy, [property]: value });
  };
  const handleDropDownChange = (value, id, type = "array") => {
    let filter = { ...advFilterState };
    if (type === "array") {
      filter[id] = { ...value, type };
    } else {
      filter[id] = { value, type };
    }
    setAdvFilterState({ ...advFilterState, ...filter });
  };

  const handleBasicFilter = (value, id, type = "array") => {
    let filter = { ...basicFilterState };
    if (type === "array") {
      filter[id] = { ...value, type };
    } else {
      filter[id] = { value, type };
    }
    setBasicFilterState({ ...basicFilterState, ...filter });
  };
  const [snackbar, setSnackbarInfo] = useState({
    open: false,
    message: "",
    variant: "success",
  });
  const [state, setState] = useState({
    checkedA: false,
    checkedB: false,
    checkedC: false,
  });
  const [label, setLabel] = useState("Parallel Dataset");
  const [srcError, setSrcError] = useState(false);
  const [tgtError, setTgtError] = useState(false);
  const renderPage = () => {
    let data = detailedReport.responseData.filter((val) => {
      return val.sr_no === srno;
    });
    let datasetType =
      data.length && getLanguageLabel(data[0].datasetType, "datasetType")[0];
    switch (params) {
      case "inprogress":
        return <RequestNumberCreation reqno={srno} />;
      case "completed":
        return (
          <DownloadDatasetRecords
            datasetType={datasetType ? datasetType : "Parallel"}
            sentencePair={count}
            urls={urls}
          />
        );
      default:
        return <SearchResult />;
    }
  };

  const handleDatasetClick = (property) => {
    history.push(
      `${process.env.PUBLIC_URL}/search-and-download-rec/initiate/-1`
    );
    clearfilter();
    setDatasetType({ [property]: true });
    setSrcError(false);
    setTgtError(false);
  };
  const getLabel = () => {
    if (datasetType["parallel-corpus"]) return "Target Language *";
    // else if (datasetType['ocr-corpus'])
    //     return "Script *"
    else return "Language *";
  };

  const getTitle = () => {
    if (datasetType["parallel-corpus"]) return "Select Language Pair";
    // else if (datasetType['ocr-corpus'])
    //     return "Select Script"
    else return "Select Language";
  };
  const clearfilter = () => {
    setOpen(false);
    setAdvFilterState({});
    setBasicFilterState({});
    setLanguagePair({
      source: "",
      target: [],
    });
    setState({
      checkedA: false,
      checkedB: false,
      checkedC: false,
    });
  };

  const makeSubmitAPICall = (type, criteria) => {
    const Dataset = Object.keys(type)[0];
    setSnackbarInfo({
      ...snackbar,
      open: true,
      message: "Please wait while we process your request.",
      variant: "info",
    });
    const apiObj = new SubmitSearchRequest(Dataset, criteria);
    fetch(apiObj.apiEndPoint(), {
      method: "post",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        let response = await res.json();
        if (res.ok) {
          dispatch(PageChange(0, C.SEARCH_PAGE_NO));
          history.push(
            `${process.env.PUBLIC_URL}/search-and-download-rec/inprogress/${response.data.serviceRequestNumber}`
          );
          handleSnackbarClose();
        } else {
          setSnackbarInfo({
            ...snackbar,
            open: true,
            message: response.message
              ? response.message
              : "Something went wrong. Please try again.",
            variant: "error",
          });
          if (res.status === 401) {
            setTimeout(
              () => history.push(`${process.env.PUBLIC_URL}/user/login`),
              3000
            );
          }
        }
      })
      .catch((err) => {
        setSnackbarInfo({
          ...snackbar,
          open: true,
          message: "Something went wrong. Please try again.",
          variant: "error",
        });
      });
  };
  const handleSnackbarClose = () => {
    setSnackbarInfo({ ...snackbar, open: false });
  };
  const getValueForLabel = (label) => {
    return Language.filter((val) => val.label === label)[0];
  };
  const getFilterValueForLabel = (data, label) => {
    //  if (data === 'domain') {
    return FilterBy[data].filter((val) => val.label === label)[0];
    //  }
    // else if (data === 'collectionMethod') {
    //     return (FilterBy.collectionMethod.filter(val => val.label === label)[0])
    // }
  };

  const getObjectValue = (obj) => {
    let updatedObj = {};
    let objKeys = Object.keys(obj);
    objKeys.forEach((key) => {
      updatedObj[key] =
        obj[key].type === "array" ? [obj[key].value] : obj[key].value;
    });
    return updatedObj;
  };

  const getArrayValue = (arr) => {
    let updatedArr = arr.map((element) => {
      return element.value;
    });
    return updatedArr;
  };

  const handleSubmitBtn = () => {
    const obj = { ...basicFilterState, ...advFilterState };
    const criteria = {
      sourceLanguage: getArrayValue([languagePair.source]),
      targetLanguage: getArrayValue(languagePair.target),
      ...getObjectValue(obj),
      groupBy: false,
      multipleContributors: false,
      originalSourceSentence: state.checkedC,
    };
    if (datasetType["parallel-corpus"]) {
      if (languagePair.source && languagePair.target.length) {
        makeSubmitAPICall(datasetType, criteria);
      } else if (!languagePair.source && !languagePair.target.length) {
        setSrcError(true);
        setTgtError(true);
      } else if (!languagePair.source) setSrcError(true);
      else if (!languagePair.target.length) setTgtError(true);
    } else {
      if (!languagePair.target.length) setTgtError(true);
      else {
        makeSubmitAPICall(datasetType, criteria);
      }
    }
  };
  const handleChange = (label, value) => {
    setLabel(label);
    handleDatasetClick(value);
    dispatch(getFilter(value));
  };
  const [anchorEl, openEl] = useState(null);
  const handleClose = () => {
    openEl(false);
  };

  const renderDatasetButtons = () => {
    return (
      <>
        <Button
          className={classes.menuStyle}
          // disabled={page !== 0 ? true : false}
          color="inherit"
          fullWidth
          onClick={(e) => openEl(e.currentTarget)}
          variant="text"
        >
          <Typography variant="body1">{label}</Typography>
          <DownIcon />
        </Button>
        <StyledMenu
          id="data-set"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={(e) => handleClose(e)}
          className={classes.styledMenu1}
        >
          {DatasetType.map((menu) => {
            return (
              <MenuItem
                value={menu.value}
                name={menu.label}
                className={classes.styledMenu}
                onClick={() => {
                  handleChange(menu.label, menu.value);
                  handleClose();
                }}
              >
                <Typography variant={"body1"}>{menu.label}</Typography>
              </MenuItem>
            );
          })}
        </StyledMenu>
      </>

      // )
      // }
    );

    // )
  };

  const renderFilterByOptions = (id, options, filter, value, label) => {
    return (
      <MultiAutocomplete
        id={id}
        options={options}
        filter={filter}
        value={value}
        handleOnChange={handleFilterByChange}
        label={label}
      />
    );
  };

  const renderFilterByfield = (id, label, value, filter) => {
    let filterByOptions = FilterBy[id].map((data) => data.label);
    return (
      <Autocomplete
        disabled={!languagePair.target.length}
        value={filterBy[id] ? filterBy[id] : null}
        id={id}
        options={filterByOptions}
        onChange={(event, data) => handleFilterByChange(data, id)}
        renderInput={(params) => (
          <TextField fullWidth {...params} label={label} variant="standard" />
        )}
      />
    );
  };
  const renderTexfield = (id, label, value, options, filter) => {
    let labels = Language.map((lang) => lang.label);
    return (
      <Autocomplete
        value={languagePair.source ? languagePair.source : null}
        id="source"
        options={labels}
        onChange={(event, data) => handleLanguagePairChange(data, "source")}
        renderInput={(params) => (
          <TextField
            fullWidth
            {...params}
            label="Source Language *"
            variant="standard"
            error={srcError}
            helperText={srcError && "This field is mandatory"}
          />
        )}
      />
    );
  };
  const renderCheckBox = (name, color, label) => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={state[name]}
            onChange={handleCheckboxChange}
            name={name}
            color={color}
          />
        }
        label={label}
      />
    );
  };
  const getTargetLang = () => {
    return Language.filter((lang) => lang.label !== languagePair.source);
  };
  const renderclearNsubmitButtons = () => {
    return (
      <Grid
        container
        className={classes.clearNSubmit}
        style={{ marginTop: open ? "2rem" : "18rem" }}
      >
        <Grid item xs={3}></Grid>
        <Grid item xs={9}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                size="large"
                fullWidth
                variant="outlined"
                onClick={clearfilter}
              >
                Clear
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                disabled={!languagePair.target.length}
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                onClick={handleSubmitBtn}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };
  const renderAdvanceFilter = () => {
    return (
      <div>
        {renderCheckBox("checkedA", "primary", "Vetted by multiple annotators")}
        {datasetType["parallel-corpus"] &&
          renderCheckBox(
            "checkedB",
            "primary",
            "Source sentences manually translated by multiple translators"
          )}
        {datasetType["parallel-corpus"] &&
          renderCheckBox(
            "checkedC",
            "primary",
            " Original sentence in source language"
          )}
      </div>
    );
  };

  const renderSubFilters = () => {
    const values = Object.values(advFilterState);
    let renderFilter = values.map((filter) => {
      if (filter && filter.hasOwnProperty("sub-filters")) {
        return filter["sub-filters"].map((val) => (
          <Grid
            className={classes.subHeader}
            item
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
          >
            {filter.type !== "text" ? (
              <SingleAutoComplete
                handleChange={handleDropDownChange}
                disabled={!languagePair.target.length}
                id={val.filter}
                labels={val.values}
                placeholder={`Select ${val.label}`}
              />
            ) : (
              <TextField
                disabled={!languagePair.target.length}
                id={val.filter}
                label={`Select ${val.label}`}
                fullWidth
                value={
                  advFilterState[filter.value]
                    ? advFilterState[filter.value].value
                    : ""
                }
                onChange={(e) =>
                  handleDropDownChange(e.target.value, filter.value, "text")
                }
              />
            )}
          </Grid>
        ));
      }
    });
    return renderFilter;
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid
          className={classes.leftSection}
          item
          xs={12}
          sm={5}
          md={4}
          lg={4}
          xl={4}
        >
          <Grid container spacing={2}>
            <Grid
              item
              className={
                (params === "inprogress" || params === "completed") &&
                classes.blurOut
              }
              xs={12}
              sm={12}
              md={12}
              lg={12}
              xl={12}
            >
              <Typography className={classes.subType} variant="body1">
                Select Dataset Type
              </Typography>
              <hr className={classes.styleHr} />
              <div className={classes.buttonDiv}>{renderDatasetButtons()}</div>
              <Typography className={classes.subHeader} variant="body1">
                {getTitle()}
              </Typography>
              <div className={classes.subHeader}>
                {datasetType["parallel-corpus"] && (
                  //  renderTexfield("select-source-language", "Source Language *")
                  <SingleAutoComplete
                    handleChange={handleLanguagePairChange}
                    id={"source"}
                    value={languagePair.source}
                    labels={Language}
                    placeholder={`Source Language *`}
                  />
                )}
              </div>
              <div className={classes.autoComplete}>
                <MultiAutocomplete
                  id="language-target"
                  options={getTargetLang()}
                  filter="target"
                  value={languagePair.target}
                  handleOnChange={handleLanguagePairChange}
                  label={getLabel()}
                  error={tgtError}
                  helperText="This field is mandatory"
                  disabled={
                    !languagePair.source && datasetType["parallel-corpus"]
                  }
                />
              </div>
              <Typography className={classes.subHeader} variant="body1">
                Filter by
              </Typography>
              <Grid container spacing={1}>
                {basicFilter.map((filter) => {
                  return (
                    <Grid
                      className={classes.subHeader}
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                    >
                      {filter.type !== "text" ? (
                        <SingleAutoComplete
                          handleChange={handleBasicFilter}
                          disabled={!languagePair.target.length}
                          id={filter.value}
                          value={
                            basicFilterState[filter.value]
                              ? basicFilterState[filter.value]
                              : ""
                          }
                          labels={filter.values}
                          placeholder={`Select ${filter.label}`}
                        />
                      ) : (
                        <TextField
                          disabled={!languagePair.target.length}
                          id={filter.value}
                          label={`Select ${filter.label}`}
                          value={
                            basicFilterState[filter.value]
                              ? basicFilterState[filter.value].value
                              : ""
                          }
                          onChange={(e) =>
                            handleBasicFilter(
                              e.target.value,
                              filter.value,
                              "text"
                            )
                          }
                          fullWidth
                        />
                      )}
                    </Grid>
                  );
                })}
              </Grid>
              <div className={classes.advanceFilter}>
                <Button
                  disabled={!languagePair.target.length}
                  style={{ color: "#FD7F23" }}
                  variant="outlined"
                  size="small"
                  onClick={() => setOpen(!open)}
                >
                  Advanced filter
                </Button>
              </div>
              <div className={classes.advanceFilterContainer}>
                {open &&
                  advFilter.map((filter) => {
                    return (
                      <Grid
                        className={classes.subHeader}
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                      >
                        {filter.type !== "text" ? (
                          <SingleAutoComplete
                            handleChange={handleDropDownChange}
                            disabled={!languagePair.target.length}
                            id={filter.value}
                            labels={filter.values}
                            placeholder={`Select ${filter.label}`}
                            value={
                              advFilterState[filter.value]
                                ? advFilterState[filter.value]
                                : ""
                            }
                          />
                        ) : (
                          <TextField
                            disabled={!languagePair.target.length}
                            id={filter.value}
                            label={`Select ${filter.label}`}
                            fullWidth
                            value={
                              advFilterState[filter.value]
                                ? advFilterState[filter.value].value
                                : ""
                            }
                            onChange={(e) =>
                              handleDropDownChange(
                                e.target.value,
                                filter.value,
                                "text"
                              )
                            }
                          />
                        )}
                      </Grid>
                    );
                  })}
                {renderSubFilters()}
                {open && renderAdvanceFilter()}
              </div>
              {renderclearNsubmitButtons()}
            </Grid>
          </Grid>
        </Grid>

        <Grid
          item
          xs={12}
          sm={7}
          md={8}
          lg={8}
          xl={8}
          className={classes.parent}
        >
          {renderPage()}
        </Grid>
      </Grid>
      {snackbar.open && (
        <Snackbar
          open={snackbar.open}
          handleClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          message={snackbar.message}
          variant={snackbar.variant}
        />
      )}
    </div>
  );
};

export default withStyles(DatasetStyle)(SearchAndDownloadRecords);
