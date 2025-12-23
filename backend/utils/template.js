module.exports = ({ name, certification, fromDate, toDate, courseName }) => {
  return `
    <h2>Certificate Information</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Certification:</strong> ${certification}</p>
    <p><strong>Course Name:</strong> ${courseName}</p>
    <p><strong>From:</strong> ${fromDate}</p>
    <p><strong>To:</strong> ${toDate}</p>
  `;
};
