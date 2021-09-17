import {
  Grid,
  Typography,
  Button,
  TextField,
  Menu,
  MenuItem,
} from "@material-ui/core";
import DownIcon from "@material-ui/icons/ArrowDropDown";
import { withStyles, MuiThemeProvider } from "@material-ui/core/styles";
import DatasetStyle from "../../../styles/Dataset";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchModel from "../../../../redux/actions/api/Model/ModelSearch/SearchModel";
import APITransport from "../../../../redux/actions/apitransport/apitransport";
import aunthenticate from "../../../../configs/authenticate";
import Theme from "../../../theme/theme-default";
import SearchModelFilterAPI from "../../../../redux/actions/api/Model/ModelLeaderboard/SearchModelFilter";
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
const Benchmark = (props) => {
  const { classes } = props;
  const dispatch = useDispatch();
  const param = useParams();
  const [datasetType, setDatasetType] = useState("translation");
  const searchFilter = useSelector((state) => state.searchModelFilter);
  const Language = searchFilter.sourceLanguage;
  const FilterBy = {
    metric: searchFilter.metric[datasetType],
    benchmarkDataset: searchFilter.benchmarkDataset[datasetType],
  };
  const [languagePair, setLanguagePair] = useState({
    source: "",
    target: [],
  });
  const [filterBy, setFilterBy] = useState({
    domain: "",
    metric: "",
    benchmarkDataset: "",
  });

  const makeSubmitAPICall = (src, tgt, type) => {
    const Dataset = Object.keys(type)[0];
    const apiObj = new SearchModel(Dataset, src, tgt);
    dispatch(APITransport(apiObj));
  };

  useEffect(() => {
    const apiObj = new SearchModelFilterAPI();
    dispatch(APITransport(apiObj));
  }, []);

  const handleLanguagePairChange = (value, property) => {
    setLanguagePair({ ...languagePair, [property]: value });

    if (property === "source") setSrcError(false);
    else setTgtError(false);
  };

  const handleFilterByChange = (value, property) => {
    setFilterBy({ ...filterBy, [property]: value });
  };

  const [snackbar, setSnackbarInfo] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  const modelLabel = "Translation";
  const [label, setLabel] = useState(modelLabel);
  const [srcError, setSrcError] = useState(false);
  const [tgtError, setTgtError] = useState(false);
  const { params } = param;

  const handleDatasetClick = (property) => {
    clearfilter();
    setDatasetType(property);
    setSrcError(false);
    setTgtError(false);
  };

  const getTitle = () => {
    if (datasetType === "translation") return "Select Language Pair";
    else return "Select Language";
  };
  const clearfilter = () => {
    setFilterBy({
      domain: "",
      source: "",
      collectionMethod: "",
    });
    setLanguagePair({
      source: "",
      target: "",
    });
  };
  const getValueForLabel = (label) => {
    return Language.filter((val) => val.label === label)[0];
  };

  const handleSubmitBtn = () => {
    let tgt = languagePair.target ? languagePair.target.value : "";
    let domain = "All";
    let submitter = "All";
    if (datasetType["translation"]) {
      if (languagePair.source && languagePair.target) {
        let source = languagePair.source
          ? getValueForLabel(languagePair.source).value
          : "";
        makeSubmitAPICall(source, tgt, datasetType, domain, submitter);
      } else if (!languagePair.source && !languagePair.target) {
        setSrcError(true);
        setTgtError(true);
      } else if (!languagePair.source) setSrcError(true);
      else if (!languagePair.target) setTgtError(true);
    } else {
      makeSubmitAPICall(tgt, null, datasetType, domain, submitter);
    }
  };
  const handleChange = (label, value) => {
    setLabel(label);
    handleDatasetClick(value);
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
          {searchFilter.task.map((menu) => {
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
    );
  };

  const renderTexfield = (id, label, value, options, filter) => {
    let labels = Language.map((lang) => lang.label);
    return (
      <Autocomplete
        value={languagePair[id] ? languagePair[id] : null}
        id={id}
        options={labels}
        onChange={(event, data) => handleLanguagePairChange(data, id)}
        renderInput={(params) => (
          <TextField
            fullWidth
            {...params}
            label={label}
            variant="standard"
            error={srcError}
            helperText={srcError && "This field is mandatory"}
          />
        )}
      />
    );
  };

  const renderclearNsubmitButtons = () => {
    return (
      <Grid container className={classes.clearNSubmit}>
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

  return (
    <MuiThemeProvider theme={Theme}>
      <div className={classes.parentPaper}>
        <Grid container spacing={3}>
          <Grid
            className={classes.leftSection}
            item
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
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
                  Select Model Task
                </Typography>
                <hr className={classes.styleHr} />
                <div className={classes.buttonDiv}>
                  {renderDatasetButtons()}
                </div>
                <Typography className={classes.subHeader} variant="body1">
                  {getTitle()}
                </Typography>
                <div className={classes.subHeader}>
                  {datasetType === "translation" && (
                    <SingleAutoComplete
                      id="source"
                      value={languagePair.source}
                      placeholder="Source Language *"
                      labels={Language}
                      handleChange={handleLanguagePairChange}
                    />
                  )}
                </div>
                <div className={classes.autoComplete}>
                  <SingleAutoComplete
                    id="target"
                    value={languagePair.target}
                    placeholder={
                      datasetType === "translation"
                        ? "Target Language *"
                        : "Language *"
                    }
                    labels={Language}
                    handleChange={handleLanguagePairChange}
                  />
                </div>
                <Typography className={classes.subHeader} variant="body1">
                  Filter by
                </Typography>
                <Grid container spacing={1}>
                  <Grid
                    className={classes.subHeader}
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={12}
                  >
                    <SingleAutoComplete
                      id="metric"
                      value={filterBy.metric}
                      placeholder="Metric *"
                      labels={FilterBy.metric ? FilterBy.metric : []}
                      handleChange={handleFilterByChange}
                    />
                  </Grid>
                  <Grid
                    className={classes.subHeader}
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={12}
                  >
                    <SingleAutoComplete
                      id="benchmarkDataset"
                      value={filterBy.benchmarkDataset}
                      placeholder="Benchmark Dataset *"
                      labels={
                        FilterBy.benchmarkDataset
                          ? FilterBy.benchmarkDataset
                          : []
                      }
                      handleChange={handleFilterByChange}
                    />
                  </Grid>
                </Grid>

                {renderclearNsubmitButtons()}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </MuiThemeProvider>
  );
};

export default withStyles(DatasetStyle)(Benchmark);
