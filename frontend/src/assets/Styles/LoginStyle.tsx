export const relative = {
    position:"relative"
}
export const LoginStyle = {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
}
export const LoginLeft = {
    width:'50%',
    height: '100%',
    ...relative,
    overflow: 'hidden',
    "@media (max-width:992px)": {
        display:"none"
    },
}
export const LoginRight = {
    width:'50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'space-between',
    minHeight: '100vh',
    padding:"10px 15px",
    "@media (min-height:730px)": {
        height: '600px',
        minHeight: '600px',
    },
    "@media (max-height:550px)": {
        height: '600px',
    },
    "@media (max-width:992px)": {
        width:'100%',
    },
}
export const width100 = {
    width:'100%',
}
export const LoginImage = {
    ...width100,
    objectFit: 'cover',
    height: '100vh',
    objectPosition: 'top center',
    display: 'block',
    "@media (min-height:730px)": {
        height: '600px',
    },
    "@media (max-height:550px)": {
        height: '600px',
    },
}
export const boxOne = {
    display:"flex",
    gap: "10px",
    alignItems: 'center',
    ...width100,
    "& h2": {
        fontSize: '18px',
        fontFamily:'Bold_M',
        color:'var(--buttonPrimary)',
    }
}
export const boxTwo = {
    display:"flex",
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width:"55%",
    margin: 'auto',
    "& h3": {
        fontSize: '22px',
        fontFamily:'Bold_M',
        color:'var(--title)',
    },
    "& h6": {
        fontSize: '12px',
        fontFamily:'Medium_M',
        color:'var(--title)',
        paddingTop:'8px'
    },
    "& form":{
        ...width100,
        marginTop:'20px',
        "& h6":{
            fontSize:'10px',
            fontFamily:'Medium_M',
            paddingTop:'0px',
            textAlign:'right',
            color:"var(--buttonPrimary)"
        }
    },
    "@media (max-width:1000px)": {
        width:'70%',
    },
    "@media (max-width:992px)": {
        width:'50%',
    },
    "@media (max-width:700px)": {
        width:'70%',
    },
    "@media (max-width:500px)": {
        width:'85%',
    },
    "@media (max-width:400px)": {
        width:'90%',
    },
}
export const boxThree = {
    ...width100,
    display:"flex",
    alignItems: 'center',
    justifyContent: 'space-between',
    "& h4":{
        fontSize:'12px',
        color:'var(--grey)',
        fontFamily:'Regular_M',
        display:"flex",
        alignItems: 'center',
        gap: "7px",
    }
}
export const loginLogo = {
    width: '18px',
}
export const marginBottom10 = {
    marginBottom: "10px" 
}
export const microsoftBtn = {
    borderColor:'var(--borderColor)',
    color:'var(--title)',
    fontFamily:'Medium_M',
}
export const microsoftBottom = {
    fontSize:'12px',   
    color:'var(--grey)',
    textAlign:'center',
    paddingTop:'10px',
    "& span":{
        color:'var(--buttonPrimary)',
        fontFamily:'SemiBold_M',
        cursor:'pointer'
    }
}
export const ForgetButton = {
    cursor:'pointer',
    color:'var(--primary)',
}
export const loginOr = {
    fontSize:'12px',   
    color:'var(--grey)',
    textAlign:'center',
    marginTop:'10px',
    "&::after":{
        content: '""',
        width: '45%',
        height: '1px',
        backgroundColor: 'var(--borderColor)',
        margin: 'auto',
        top: '0px',
        bottom: '0px',
        left: '0px',
        position: 'absolute',
    },
    "&::before":{
        content: '""',
        width: '45%',
        height: '1px',
        backgroundColor: 'var(--borderColor)',
        margin: 'auto',
        top: '0px',
        bottom: '0px',
        right: '0px',
        position: 'absolute',
    }
}

export const LoginOverLay = {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.3,
}
export const blinkKeyframes = {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.3 },
    '100%': { opacity: 1 }
}
export const blinkKeyframesTimer = {
    '0%': { opacity: 0.5 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.5 }
}
export const whiteStar = {
    animation: 'blink 3s infinite ease-in-out',
    '@keyframes blink': blinkKeyframes,
}
export const blueStarTwo = {
    animation: 'blink 3s infinite ease-in-out',
    '@keyframes blink': blinkKeyframesTimer,
    width: '25px',
    marginBottom:"40px"
}
export const blueStarOne = {
    animation: 'blink 3s infinite ease-in-out',
    '@keyframes blink': blinkKeyframesTimer,
    width: '20px'
}
export const LoginContentOverlay = {
    position: 'absolute',
    bottom:"10%",
    left: "5%",
    "& h3":{
        fontSize: '50px',
        fontFamily:'SemiBold_M',
        color:'var(--white)',
    },
    "& h4":{
        fontSize: '12px',
        fontFamily:'Medium_M',
        color:'var(--white)',
        paddingTop:'15px'
    }
}