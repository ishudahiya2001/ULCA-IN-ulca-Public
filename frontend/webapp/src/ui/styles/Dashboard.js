const FileUploadStyles = (theme) => ({

  breadcrum: {
    marginBottom: "1.5rem",
  },

  cursor: {
    cursor: "pointer",
  },
  titleBar: {
    
    display: "flex",
    flexDirection: "row",
    padding:"2.5rem 0 0 3%"
  },
  paper: {
    minHeight:"56px",
    maxWidth: "1272px",
    width : "100%",
    margin :"17px auto",
    padding:"0"
  },
 
  select: {
    marginLeft:"10px",
    width: "20%",
    minWidth: "10rem",
    color:"green",
    cursor: "pointer"
  },
  filterButton:{
    marginLeft: 'auto',
    paddingRight: '1.5%',
    minWidth:"auto",
    display: "flex",
    flexDirection: "row",
    cursor: "pointer",
   

    // "@media (max-width:800px)": {
    //   display: 'none'
    // }
  },
  infoBtn:{height:"60px",width:"40px", position:"absolute", marginTop:"17px"}
  ,
  filterButtonIcon:{
    
    display: 'none',
    "@media (max-width:800px)": {
      marginLeft: 'auto',
      display: 'block',
    marginRight: '5%',
    maxWidth:"3rem",
    maxHeight:"2.3rem"
    }
  },

  langPairButtons: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    padding: ".6rem 1rem",
    boxSizing: "border-box",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #EEEEF0",
    padding: ".6rem 1rem",
    width: "100%",
    boxSizing: "border-box",
  },
  backButton: {
    boxShadow: "none",
    paddingTop:"5px",
    marginLeft: "1.3rem",
    marginRight: ".5rem"
    
  },
  titleText: {
    marginLeft: "1.68rem",
    marginRight:".5rem"
    
  },
  seperator: {
    width: "1px",
    height: "2rem",
    backgroundColor: "#DADCE0",
    margin: "0 1rem",
    fontSize: ".75rem",
  },
  cardHeaderContainer: {
    display: "flex",
    flexDirection: "row",
    minHeight: "2.3rem",
  },
  iconStyle:{
    marginRight:".7rem",
    "@media (max-width:800px)": {marginRight:"0"}
  },
  titleDropdown:
    {marginLeft:"1rem",minWidth:"10rem"}
  ,

  title:{
    textAlign: "left",
    paddingLeft:"3%",
    margin: "4.5vh 0 0vh 1vh",
    "@media (max-width:600px)": {textAlign: "center",}
  }
});

export default FileUploadStyles;