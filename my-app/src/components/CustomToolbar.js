 // src/components/CustomToolbar.js
const CustomToolbar = ({ label, onView, views }) => (
  <div className="rbc-toolbar custom-toolbar">
    {/* <div className="rbc-toolbar-center">
      <span className="rbc-toolbar-label">{label}</span>
    </div> */}
    <div className="rbc-btn-group">
      {views.includes("month") && (
        <button onClick={() => onView("month")}>Month</button>
      )}
      {views.includes("week") && (
        <button onClick={() => onView("week")}>Week</button>
      )}
    </div>
  </div>
);
export default CustomToolbar;

