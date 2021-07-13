import { withStyles } from "@material-ui/core";
import BreadCrum from '../../../components/common/Breadcrum';
import React, { useEffect, useState } from "react";
import DataSet from "../../../styles/Dataset";
import UrlConfig from '../../../../configs/internalurlmapping';
import AppendDataset from "./AppendDataset";
import { useHistory } from "react-router-dom";

const DatasetDetails = (props) => {
    const { classes } = props;
    const history = useHistory();
    const handleCardNavigation = () => {

        history.push(`${process.env.PUBLIC_URL}/my-contribution`)
    }
    return (
        <div>
            <div className={classes.breadcrum}>
                <BreadCrum links={[UrlConfig.dataset, UrlConfig.myContribution]} activeLink="Dataset details" />
            </div>
            <AppendDataset
                datasetId={'0005127'}
                datasetName={'Tourism Set-1 Parallel Text Corpus'}
                datasetType={'Parallel Dataset'}
                submittedOn={'14/4/2021'}
                lastUpdatedOn={'13/4/2021'}
                languagePair={'English-Hindi'}
                domain={'Legal, News'}
                publishedRecords={1255822}
                deletedRecords={3250}
                erroneousRecords={11132}
                 handleCardNavigation={handleCardNavigation}
                status={'Published'}

            />


        </div >
    )
};



export default withStyles(DataSet)(DatasetDetails);