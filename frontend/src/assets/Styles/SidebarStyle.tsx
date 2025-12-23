export const SidebarBox = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
}
export const SidebarBoxOne = {
    display: 'flex',
    alignItems:'center',
    justifyContent: 'start',
    gap:"10px",
    paddingBottom:"12px",
    marginTop: '25px',
    paddingLeft:"10px",
    paddingRight:"10px",
    "& img": {
        width: '80px',
    },
    "& h3": {
        fontFamily: "Bold_M",
        fontSize: '20px',
        color: 'var(--white)',
    },
    borderBottom:"1px solid var(--sidebarBack)"
}
export const SidebarBoxTwo = {
    marginTop: '12px',
    "h4":{
        fontFamily: "Regular_M",
        color:'var(--greyText)',
        fontSize:'11px',
        paddingLeft:"10px",
        paddingRight:"10px",
    },
}
export const SidebarBoxThree = {
    marginTop: '20px',
    "h4":{
        fontFamily: "Regular_M",
        color:'var(--greyText)',
        fontSize:'11px',
        paddingLeft:"10px",
        paddingRight:"10px",
    },
}
export const SidebarLinks = {
    marginTop: '12px',
    "& a":{
        fontFamily: "Regular_M",
        color:'var(--greyText)',
        fontSize:'15px',   
        textDecoration:'none',
    },
    "& div":{
        display:'flex',
        alignItems:'center',
        justifyContent:'start',
        gap:"8px",
        padding:"10px 0px",
        margin:"5px 0px",
        paddingLeft:"10px",
        paddingRight:"10px",
    },
    "& div:hover":{
        backgroundColor:'var(--buttonPrimary)',
        color:'var(--white)',
    },
}
export const SidebarBottom = {
    borderTop:"1px solid var(--sidebarBack)",
    padding:"10px 14px",
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    "& img":{
        width:'40px',
        borderRadius:'100%',
    },
    "& h2":{
        fontSize:'14px',
        fontFamily: "Medium_M",
        color:'var(--white)',
        paddingBottom:"5px",
    },
    "& h3":{
        fontSize:'12px',
        fontFamily: "Medium_M",
        color:'var(--greyText)',
    },
    "& svg":{
        fontSize:'18px',
        color:'var(--white)',
    },

}
export const LogoutBox = {
    cursor:'pointer',
}
export const SidebarBottomLeft = {
    display:'flex',
    justifyContent:'start',
    gap:"10px",
    alignItems:'center',
}