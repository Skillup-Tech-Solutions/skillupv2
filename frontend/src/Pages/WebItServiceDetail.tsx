import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
} from "@mui/material";
import { FaAngleLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import CodeIcon from "@mui/icons-material/Code";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CloudIcon from "@mui/icons-material/Cloud";
import SecurityIcon from "@mui/icons-material/Security";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import BrushIcon from "@mui/icons-material/Brush";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RouterIcon from "@mui/icons-material/Router";
import BugReportIcon from "@mui/icons-material/BugReport";
import CampaignIcon from "@mui/icons-material/Campaign";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const itServicesData: Record<
    string,
    {
        icon: any;
        title: string;
        desc: string;
        features: string[];
        technologies: string[];
        benefits: { title: string; desc: string }[];
    }
> = {
    "Web Development": {
        icon: CodeIcon,
        title: "Web Development",
        desc: "We build modern, responsive, and SEO-friendly websites using the latest technologies and best design practices. Our solutions range from simple static landing pages to dynamic portals and fully functional web applications. We prioritize clean design, optimal performance, and strong user experiences. Whether you're a startup, a student, or an established business, we tailor web development to your goals.",
        features: [
            "Custom Website Development",
            "E-commerce Solutions",
            "Progressive Web Apps (PWA)",
            "Content Management Systems",
            "API Development & Integration",
            "Website Maintenance & Support",
        ],
        technologies: ["React", "Angular", "Vue.js", "Next.js", "Node.js", "TypeScript", "MongoDB", "PostgreSQL"],
        benefits: [
            { title: "Responsive Design", desc: "Websites that work perfectly on all devices and screen sizes" },
            { title: "SEO Optimized", desc: "Built with search engine optimization best practices" },
            { title: "Fast Performance", desc: "Optimized for speed and excellent user experience" },
            { title: "Scalable Architecture", desc: "Solutions that grow with your business needs" },
        ],
    },
    "Mobile App Development": {
        icon: PhoneAndroidIcon,
        title: "Mobile App Development",
        desc: "We develop intuitive and robust mobile applications for Android and iOS platforms using both native and cross-platform tools. Whether you need an app for education, business, or productivity, we focus on user experience, speed, and seamless functionality. From wireframing to deployment on the Play Store or App Store, our process is collaborative and transparent.",
        features: [
            "Native iOS Development",
            "Native Android Development",
            "Cross-Platform Apps",
            "App Store Deployment",
            "Push Notifications",
            "Offline Functionality",
        ],
        technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "REST APIs"],
        benefits: [
            { title: "Cross-Platform", desc: "Single codebase for iOS and Android" },
            { title: "Native Performance", desc: "Smooth and responsive user experience" },
            { title: "App Store Ready", desc: "Complete deployment assistance" },
            { title: "Post-Launch Support", desc: "Ongoing updates and maintenance" },
        ],
    },
    "Cloud Solutions": {
        icon: CloudIcon,
        title: "Cloud Solutions",
        desc: "AWS, Azure, and Google Cloud services including migration, deployment, serverless architecture, and cloud infrastructure management. We help businesses leverage cloud computing to reduce costs, improve scalability, and enhance security. Our cloud solutions are designed to meet your specific business requirements.",
        features: [
            "Cloud Migration",
            "Serverless Architecture",
            "Cloud Infrastructure Setup",
            "Auto-Scaling Solutions",
            "Backup & Disaster Recovery",
            "Cloud Cost Optimization",
        ],
        technologies: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform"],
        benefits: [
            { title: "Cost Efficient", desc: "Pay only for what you use" },
            { title: "High Availability", desc: "99.9% uptime guaranteed" },
            { title: "Scalable", desc: "Scale resources on demand" },
            { title: "Secure", desc: "Enterprise-grade security" },
        ],
    },
    "Cybersecurity": {
        icon: SecurityIcon,
        title: "Cybersecurity Services",
        desc: "Comprehensive security solutions including vulnerability assessment, penetration testing, security audits, and compliance management to protect your digital assets. We help organizations identify and mitigate security risks before they become threats.",
        features: [
            "Vulnerability Assessment",
            "Penetration Testing",
            "Security Audits",
            "Compliance Management",
            "Incident Response",
            "Security Training",
        ],
        technologies: ["OWASP", "Burp Suite", "Nessus", "Metasploit", "SIEM Tools"],
        benefits: [
            { title: "Risk Mitigation", desc: "Identify vulnerabilities before attackers" },
            { title: "Compliance", desc: "Meet industry security standards" },
            { title: "24/7 Monitoring", desc: "Continuous threat detection" },
            { title: "Expert Team", desc: "Certified security professionals" },
        ],
    },
    "AI & Machine Learning": {
        icon: PsychologyIcon,
        title: "AI & Machine Learning",
        desc: "Intelligent solutions powered by AI, ML, deep learning, NLP, and computer vision for automation and data-driven decision making. We help businesses leverage artificial intelligence to automate processes, gain insights, and create intelligent applications.",
        features: [
            "Machine Learning Models",
            "Natural Language Processing",
            "Computer Vision",
            "Predictive Analytics",
            "Chatbots & Virtual Assistants",
            "Recommendation Systems",
        ],
        technologies: ["Python", "TensorFlow", "PyTorch", "OpenAI", "Scikit-learn", "Hugging Face"],
        benefits: [
            { title: "Automation", desc: "Automate repetitive tasks" },
            { title: "Insights", desc: "Data-driven decision making" },
            { title: "Personalization", desc: "Tailored user experiences" },
            { title: "Efficiency", desc: "Improved operational efficiency" },
        ],
    },
    "Data Analytics & BI": {
        icon: BarChartIcon,
        title: "Data Analytics & Business Intelligence",
        desc: "Transform raw data into actionable insights with business intelligence, data visualization, and advanced analytics solutions. We help organizations make smarter decisions by providing clear visibility into their data through dashboards and reports.",
        features: [
            "Data Visualization",
            "Business Intelligence Dashboards",
            "Predictive Analytics",
            "Data Warehousing",
            "ETL Processes",
            "Custom Reporting",
        ],
        technologies: ["Power BI", "Tableau", "Python", "SQL", "Apache Spark", "Looker"],
        benefits: [
            { title: "Actionable Insights", desc: "Turn data into decisions" },
            { title: "Real-time Analytics", desc: "Live data monitoring" },
            { title: "Custom Dashboards", desc: "Tailored to your needs" },
            { title: "Data Integration", desc: "Connect all data sources" },
        ],
    },
    "DevOps & Automation": {
        icon: SettingsIcon,
        title: "DevOps & Automation",
        desc: "Streamline development with CI/CD pipelines, containerization, infrastructure as code, and automated deployments. We help teams deliver software faster and more reliably through modern DevOps practices.",
        features: [
            "CI/CD Pipeline Setup",
            "Container Orchestration",
            "Infrastructure as Code",
            "Automated Testing",
            "Monitoring & Logging",
            "Release Management",
        ],
        technologies: ["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "Ansible"],
        benefits: [
            { title: "Faster Delivery", desc: "Accelerate software releases" },
            { title: "Reliability", desc: "Consistent deployments" },
            { title: "Automation", desc: "Reduce manual errors" },
            { title: "Scalability", desc: "Scale infrastructure easily" },
        ],
    },
    "UI/UX Design": {
        icon: BrushIcon,
        title: "UI/UX Design",
        desc: "User-centered design services including wireframing, prototyping, user research, and creating intuitive digital experiences. We design interfaces that users love and that drive business results.",
        features: [
            "User Research",
            "Wireframing",
            "Prototyping",
            "Visual Design",
            "Usability Testing",
            "Design Systems",
        ],
        technologies: ["Figma", "Adobe XD", "Sketch", "InVision", "Framer"],
        benefits: [
            { title: "User-Centered", desc: "Designed for your users" },
            { title: "Intuitive", desc: "Easy to use interfaces" },
            { title: "Consistent", desc: "Unified design language" },
            { title: "Accessible", desc: "Inclusive design practices" },
        ],
    },
    "ERP Solutions": {
        icon: AccountTreeIcon,
        title: "ERP Solutions",
        desc: "Custom ERP development and implementation to streamline business processes, inventory, HR, and financial management. We help organizations integrate their operations into a single, unified system.",
        features: [
            "Custom ERP Development",
            "ERP Implementation",
            "CRM Integration",
            "Inventory Management",
            "HR Management",
            "Financial Management",
        ],
        technologies: ["SAP", "Oracle", "Microsoft Dynamics", "Odoo", "Custom Solutions"],
        benefits: [
            { title: "Unified System", desc: "All processes in one place" },
            { title: "Efficiency", desc: "Streamlined operations" },
            { title: "Visibility", desc: "Real-time business insights" },
            { title: "Scalable", desc: "Grows with your business" },
        ],
    },
    "Network Infrastructure": {
        icon: RouterIcon,
        title: "Network Infrastructure",
        desc: "Complete networking solutions including setup, configuration, monitoring, and maintenance of LAN/WAN infrastructure. We ensure your network is secure, reliable, and optimized for performance.",
        features: [
            "Network Design & Setup",
            "LAN/WAN Configuration",
            "Network Security",
            "Performance Monitoring",
            "Troubleshooting & Support",
            "VPN Solutions",
        ],
        technologies: ["Cisco", "Juniper", "Fortinet", "Ubiquiti", "SolarWinds"],
        benefits: [
            { title: "Reliable", desc: "Stable network connectivity" },
            { title: "Secure", desc: "Protected from threats" },
            { title: "Optimized", desc: "Peak performance" },
            { title: "24/7 Support", desc: "Always available help" },
        ],
    },
    "Software Testing & QA": {
        icon: BugReportIcon,
        title: "Software Testing & QA",
        desc: "Manual and automated testing services including functional, performance, security, and compatibility testing. We ensure your software meets the highest quality standards before release.",
        features: [
            "Manual Testing",
            "Automated Testing",
            "Performance Testing",
            "Security Testing",
            "API Testing",
            "Mobile Testing",
        ],
        technologies: ["Selenium", "Cypress", "Jest", "JMeter", "Postman", "Appium"],
        benefits: [
            { title: "Quality Assurance", desc: "Bug-free software" },
            { title: "Fast Feedback", desc: "Quick issue detection" },
            { title: "Automation", desc: "Efficient test cycles" },
            { title: "Comprehensive", desc: "Full test coverage" },
        ],
    },
    "Digital Marketing": {
        icon: CampaignIcon,
        title: "Digital Marketing",
        desc: "SEO, SEM, social media marketing, content strategy, and analytics to boost your online presence and drive business growth. We help businesses reach their target audience and convert leads into customers.",
        features: [
            "Search Engine Optimization",
            "Pay-Per-Click Advertising",
            "Social Media Marketing",
            "Content Marketing",
            "Email Marketing",
            "Analytics & Reporting",
        ],
        technologies: ["Google Ads", "Google Analytics", "SEMrush", "HubSpot", "Mailchimp"],
        benefits: [
            { title: "Visibility", desc: "Increased online presence" },
            { title: "Traffic", desc: "More website visitors" },
            { title: "Leads", desc: "Quality lead generation" },
            { title: "ROI", desc: "Measurable results" },
        ],
    },
    "IT Consulting": {
        icon: SupportAgentIcon,
        title: "IT Consulting",
        desc: "Strategic IT consulting to help businesses optimize technology investments, digital transformation, and IT governance. We provide expert guidance to align technology with business goals.",
        features: [
            "IT Strategy",
            "Digital Transformation",
            "Technology Assessment",
            "IT Governance",
            "Vendor Management",
            "Cost Optimization",
        ],
        technologies: ["ITIL", "COBIT", "Agile", "TOGAF"],
        benefits: [
            { title: "Strategic Alignment", desc: "IT aligned with business" },
            { title: "Cost Savings", desc: "Optimized IT spending" },
            { title: "Expert Guidance", desc: "Industry best practices" },
            { title: "Risk Management", desc: "Mitigated IT risks" },
        ],
    },
};

const WebItServiceDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const serviceTitle = location.state;
    const data = itServicesData[serviceTitle];

    if (!data) {
        return (
            <Box>
                <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{
                        mb: 3,
                        fontFamily: "Medium_W",
                        borderColor: "var(--webprimary)",
                        color: "var(--webprimary)",
                        width: "35px",
                        minWidth: "35px",
                        height: "35px",
                        borderRadius: "100%",
                        padding: 0,
                        "&:hover": {
                            backgroundColor: "var(--webprimary)",
                            color: "#fff",
                        },
                    }}
                >
                    <FaAngleLeft style={{ fontSize: "14px" }} />
                </Button>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ fontFamily: "SemiBold_W", mb: 2 }}
                >
                    Service Not Found
                </Typography>
                <Typography sx={{ fontFamily: "Regular_W" }}>
                    Please select a service from the IT Services page.
                </Typography>
            </Box>
        );
    }

    const IconComponent = data.icon;

    return (
        <Box>
            {/* Back Button */}
            <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                    mb: 3,
                    fontFamily: "Medium_W",
                    borderColor: "var(--webprimary)",
                    color: "var(--webprimary)",
                    width: "35px",
                    minWidth: "35px",
                    height: "35px",
                    borderRadius: "100%",
                    padding: 0,
                    "&:hover": {
                        backgroundColor: "var(--webprimary)",
                        color: "#fff",
                    },
                }}
            >
                <FaAngleLeft style={{ fontSize: "14px" }} />
            </Button>

            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", gap: 3 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "12px",
                        backgroundColor: "var(--weblight)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <IconComponent
                        sx={{
                            fontSize: 32,
                            color: "var(--webprimary)",
                        }}
                    />
                </Box>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{
                            fontFamily: "Bold_W",
                            fontSize: "28px",
                            mb: 1,
                            "@media (max-width: 768px)": { fontSize: "24px" },
                        }}
                    >
                        {data.title}
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "Regular_W",
                            fontSize: "14px",
                            color: "#666",
                            lineHeight: 1.7,
                            maxWidth: "700px",
                        }}
                    >
                        {data.desc}
                    </Typography>
                </Box>
            </Box>

            {/* Technologies */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    sx={{
                        fontFamily: "SemiBold_W",
                        fontSize: "18px",
                        mb: 2,
                    }}
                >
                    Technologies We Use
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {data.technologies.map((tech, idx) => (
                        <Chip
                            key={idx}
                            label={tech}
                            sx={{
                                fontFamily: "Medium_W",
                                fontSize: "12px",
                                backgroundColor: "var(--weblight)",
                                color: "var(--webprimary)",
                                border: "1px solid #e0e0e0",
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Features */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    sx={{
                        fontFamily: "SemiBold_W",
                        fontSize: "18px",
                        mb: 2,
                    }}
                >
                    What We Offer
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    {data.features.map((feature, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                flexBasis: { xs: "100%", sm: "48%", md: "30%" },
                                p: 2,
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: "var(--webprimary)",
                                    flexShrink: 0,
                                }}
                            />
                            <Typography
                                sx={{
                                    fontFamily: "Medium_W",
                                    fontSize: "14px",
                                }}
                            >
                                {feature}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Benefits */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    sx={{
                        fontFamily: "SemiBold_W",
                        fontSize: "18px",
                        mb: 2,
                    }}
                >
                    Key Benefits
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "space-between",
                    }}
                >
                    {data.benefits.map((benefit, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                flexBasis: { xs: "100%", sm: "48%" },
                            }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: "10px",
                                    border: "1px solid #e0e0e0",
                                    height: "100%",
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        sx={{
                                            fontFamily: "SemiBold_W",
                                            fontSize: "16px",
                                            mb: 0.5,
                                        }}
                                    >
                                        {benefit.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: "Regular_W",
                                            fontSize: "14px",
                                            color: "#666",
                                        }}
                                    >
                                        {benefit.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* CTA */}
            <Box
                sx={{
                    backgroundColor: "var(--weblight)",
                    borderRadius: "10px",
                    p: 4,
                    textAlign: "center",
                    border: "1px solid #e0e0e0",
                }}
            >
                <Typography
                    sx={{
                        fontFamily: "SemiBold_W",
                        fontSize: "20px",
                        mb: 1,
                    }}
                >
                    Interested in {data.title}?
                </Typography>
                <Typography
                    sx={{
                        fontFamily: "Regular_W",
                        fontSize: "14px",
                        color: "#666",
                        mb: 3,
                    }}
                >
                    Let's discuss your project and find the perfect solution
                </Typography>
                <Box
                    component="a"
                    href="/#/contact"
                    sx={{
                        display: "inline-block",
                        background: "var(--webprimary)",
                        color: "#fff",
                        padding: "12px 28px",
                        borderRadius: "6px",
                        fontFamily: "Medium_W",
                        fontSize: "14px",
                        textDecoration: "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            opacity: 0.9,
                        },
                    }}
                >
                    Get a Quote
                </Box>
            </Box>
        </Box>
    );
};

export default WebItServiceDetail;
