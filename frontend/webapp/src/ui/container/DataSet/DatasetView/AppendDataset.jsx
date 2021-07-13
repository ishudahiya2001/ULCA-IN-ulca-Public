import { withStyles, Typography, Paper, Button, Grid } from "@material-ui/core";
import React from "react";

import DataSet from "../../../styles/Dataset";
import { ArrowBack } from '@material-ui/icons';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
const AppendDataset = (props) => {
    const { classes } = props;
    return (
        <div>
            <Paper elevation={3} className={classes.paper}>
                <div>
                    <><Button size="small" color="primary" className={classes.backButton} startIcon={<ArrowBack />} onClick={ props.handleCardNavigation}>Back</Button></>
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
                                            {props.datasetId}
                                        </Typography>
                                    </Grid>
                                    < Grid item xs={4} sm={4} md={4} lg={4} xl={4} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Dataset Name
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.datasetName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Dataset Type
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.datasetType}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Submitted On
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.submittedOn}
                                        </Typography>
                                    </Grid>
                                    <Grid className={classes.lastGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Last Updated On
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.lastUpdatedOn}
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
                                            {props.languagePair}
                                        </Typography>
                                    </Grid>
                                    < Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            Domain
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.domain}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Published Records
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.publishedRecords}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.tempGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Erroneous Records
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.erroneousRecords}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2} className={classes.lastGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Deleted Records
                                        </Typography>
                                        <Typography variant="body2">
                                            {props.deletedRecords}
                                        </Typography>
                                    </Grid>
                                    {/* <Grid item className={classes.lastGrid}>
                                        <Typography variant="body2" gutterBottom>
                                            #Deleted Records
                                        </Typography>
                                        <Typography variant="body2">
                                            11,132
                                        </Typography>
                                    </Grid> */}
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
                </Grid>
            </Paper>
        </div >
    )
};



export default withStyles(DataSet)(AppendDataset);