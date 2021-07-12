import { withStyles, Typography, MuiThemeProvider, Paper, Button, Grid } from "@material-ui/core";
import BreadCrum from '../../../components/common/Breadcrum';
import React, { useEffect, useState } from "react";
import DataSet from "../../../styles/Dataset";
import { ArrowBack } from '@material-ui/icons';
import UrlConfig from '../../../../configs/internalurlmapping';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
const DatasetDetails = (props) => {
    const { classes } = props;
    const handleCardNavigation = () => { }
    return (
        <div>
            <div className={classes.breadcrum}>
                <BreadCrum links={[UrlConfig.dataset, UrlConfig.myContribution]} activeLink="Dataset details" />
            </div>

            <Paper elevation={3} className={classes.paper}>
                <div>
                    <><Button size="small" color="primary" className={classes.backButton} startIcon={<ArrowBack />} onClick={() => handleCardNavigation()}>Back</Button></>
                </div>


                <Grid container className={classes.toolGrid}>
                    < Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
                        <Grid container spacing={3}>
                            < Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Grid container>
                                    < Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.firstGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Dataset Id
                                        </Typography>
                                        <Typography variant="body2">
                                            0005127
                                        </Typography>
                                    </Grid>
                                    < Grid item xs={4} sm={4} md={4} lg={4} xl={4} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Dataset Name
                                        </Typography>
                                        <Typography variant="body2">
                                            Tourism Set-1 Parallel Text Corpus
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Dataset Type
                                        </Typography>
                                        <Typography variant="body2">
                                            Parallel Dataset
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Submitted On
                                        </Typography>
                                        <Typography variant="body2">
                                            14/4/2021
                                        </Typography>
                                    </Grid>
                                    <Grid className={classes.lastGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Last Updated On
                                        </Typography>
                                        <Typography variant="body2">
                                            13/4/2021
                                        </Typography>

                                    </Grid>
                                </Grid>
                            </Grid>
                            < Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Grid container>
                                    < Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.firstGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Language Pair
                                        </Typography>
                                        <Typography variant="body2">
                                            English-Hindi
                                        </Typography>
                                    </Grid>
                                    < Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Domain
                                        </Typography>
                                        <Typography variant="body2">
                                            Legal, News, Sports
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Published Records
                                        </Typography>
                                        <Typography variant="body2">
                                            1,255,822
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Erroneous Records
                                        </Typography>
                                        <Typography variant="body2">
                                            3,250
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Deleted Records
                                        </Typography>
                                        <Typography variant="body2">
                                            11,132
                                        </Typography>
                                    </Grid>
                                    <Grid item className={classes.lastGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Deleted Records
                                        </Typography>
                                        <Typography variant="body2">
                                            11,132
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>


                        </Grid>
                    </Grid>
                    < Grid item xs={2} sm={2} md={2} lg={2} xl={2} >
                        <Grid container style={{ borderRadius: '10%' }}>
                            < Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{
                                textAlign: 'center',
                                backgroundColor: '#F2F2F4',
                                borderBottom: '1px solid #0000001F',
                                padding: '21px 0px',
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '4px'
                            }}>
                                <Typography variant="body2" gutterBottom>
                                    Status
                                </Typography>
                                <Typography variant="body2" style={{ color: "#18A868" }}>
                                    Published
                                </Typography>
                            </Grid>
                            < Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{
                                textAlign: 'center',
                                backgroundColor: '#F2F2F4',
                                padding: '10px 0px',
                                borderBottomLeftRadius: '4px',
                                borderBottomRightRadius: '4px'
                            }}>
                                <Typography variant="body2" gutterBottom>
                                    <div
                                        style={{ display: 'inline-flex', alignItems: 'center' }}
                                    >
                                        Action
                                        <ErrorOutlineIcon style={{ marginLeft: '1%' }} fontSize="small" />
                                    </div>
                                </Typography>
                                <Button variant='contained' color="primary">Append</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* < Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            Dataset Id
                        </Typography>
                        <Typography variant="body2">
                            0005127
                        </Typography>
                    </Grid>
                    < Grid item xs={4} sm={4} md={4} lg={4} xl={4} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            Dataset Name
                        </Typography>
                        <Typography variant="body2">
                            Tourism Set-1 Parallel Text Corpus
                        </Typography>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            Dataset Type
                        </Typography>
                        <Typography variant="body2">
                            Parallel Dataset
                        </Typography>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            Submitted On
                        </Typography>
                        <Typography variant="body2">
                            14/4/2021
                        </Typography>
                    </Grid>
                    <Grid xs={2} sm={2} md={2} lg={2} xl={2} >
                        <Typography variant="body2" gutterBottom>
                            Last Updated On
                        </Typography>
                        <Typography variant="body2">
                            13/4/2021
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.toolGrid}>
                    < Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            Language Pair
                        </Typography>
                        <Typography variant="body2">
                            #Deleted Records
                        </Typography>
                    </Grid>
                    < Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            Domain
                        </Typography>
                        <Typography variant="body2">
                            Legal, News
                        </Typography>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            #Published Records
                        </Typography>
                        <Typography variant="body2">
                            1,255,822
                        </Typography>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                        <Typography variant="body2" gutterBottom>
                            #Erroneous Records
                        </Typography>
                        <Typography variant="body2">
                            3,250
                        </Typography>
                    </Grid>
                    <Grid xs={2} sm={2} md={2} lg={2} xl={2}>
                        <Typography variant="body2" gutterBottom>
                            #Deleted Records
                        </Typography>
                        <Typography variant="body2">
                            11,132
                        </Typography>
                    </Grid> */}
                </Grid>
            </Paper>
        </div >
    )
};



export default withStyles(DataSet)(DatasetDetails);