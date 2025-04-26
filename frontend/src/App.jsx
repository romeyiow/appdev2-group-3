import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/students';

function App() {


  // List & Pagination
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Add Form
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentProgram, setNewStudentProgram] = useState('');
  const [newStudentYearLevel, setNewStudentYearLevel] = useState('');

  // Editing
  const [editingStudent, setEditingStudent] = useState(null);

  // Operation Status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search by ID
  const [searchId, setSearchId] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // List Filtering
  const [filterName, setFilterName] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // --- API Functions & Handlers ---

  // Fetch Students (Pagination)
  const fetchStudents = async (page = 1) => {
    setLoading(true);
    console.log(`Fetching students for page ${page}...`);
    try {
      const response = await fetch(`${API_URL}/page/${page}`);
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {/*ignore*/ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setStudents(data);
        setCurrentPage(page);
        setError(null); // Clear general error on success
      } else {
        throw new Error("Invalid data format received from API.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  // Add Student
  const handleAddStudent = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const studentData = {
      studentId: newStudentId,
      name: newStudentName,
      program: newStudentProgram,
      yearLevel: parseInt(newStudentYearLevel, 10) || newStudentYearLevel, // Keep as string if parse fails but ensure it's required
    };
    console.log("Submitting new student:", studentData);
    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studentData) });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {/*ignore*/ }
        throw new Error(errorMsg);
      }
      setNewStudentId(''); setNewStudentName(''); setNewStudentProgram(''); setNewStudentYearLevel('');
      fetchStudents(currentPage); // Refresh
    } catch (err) {
      console.error("Add student error:", err);
      setError(err.message || 'Failed to add student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (studentIdToDelete) => {
    if (!window.confirm(`Are you sure you want to delete student ${studentIdToDelete}?`)) {
      return;
    }
    setLoading(true); // Use general loading
    setError(null);
    console.log(`Attempting to delete student: ${studentIdToDelete}`);
    try {
      const response = await fetch(`${API_URL}/${studentIdToDelete}`, { method: 'DELETE' });
      console.log(`DELETE request to ${API_URL}/${studentIdToDelete} - Status: ${response.status}`);
      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {/*ignore*/ }
        throw new Error(errorMsg);
      }
      try { const result = await response.json(); console.log("Delete Success Body:", result); } catch (e) { console.log("Delete successful (maybe 204 No Content)"); }

      let pageToRefresh = currentPage;
      if (students.length === 1 && currentPage > 1) {
        pageToRefresh = currentPage - 1;
      }
      await fetchStudents(pageToRefresh); // Refresh the list

    } catch (err) {
      console.error("--- ERROR during handleDeleteStudent ---:", err);
      setError(err.message || 'Failed to delete student.');
      setLoading(false); // Ensure loading stops on error IF fetchStudents wasn't reached/run
    }
    // setLoading(false) is handled by fetchStudents on success
  };

  // Start Editing
  const handleStartEdit = (studentToEdit) => {
    console.log("Starting edit for:", studentToEdit);
    setEditingStudent({ ...studentToEdit, program: studentToEdit.program || '', yearLevel: studentToEdit.yearLevel || '' });
    // Clear add form fields
    setNewStudentId(''); setNewStudentName(''); setNewStudentProgram(''); setNewStudentYearLevel('');
    setError(null); // Clear general errors when starting edit
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    console.log("Cancelling edit");
    setEditingStudent(null);
  };

  // Update Student
  const handleUpdateStudent = async (event) => {
    event.preventDefault();
    if (!editingStudent) return;
    setIsSubmitting(true);
    setError(null);
    const updateData = {
      name: editingStudent.name,
      program: editingStudent.program,
      yearLevel: editingStudent.yearLevel,
    };
    console.log(`Updating student ${editingStudent.studentId} with:`, updateData);
    try {
      const response = await fetch(`${API_URL}/${editingStudent.studentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {/*ignore*/ }
        throw new Error(errorMsg);
      }
      setEditingStudent(null); // Clear editing state
      fetchStudents(currentPage); // Refresh
    } catch (err) {
      console.error("Update student error:", err);
      setError(err.message || 'Failed to update student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search Student by ID
  const handleSearchById = async () => {
    if (!searchId.trim()) { setSearchError("Please enter a Student ID."); setSearchedStudent(null); return; }
    setSearchLoading(true); setSearchError(null); setSearchedStudent(null);
    console.log(`Searching for student ID: ${searchId}`);
    try {
      const response = await fetch(`${API_URL}/${searchId.trim()}`);
      console.log(`GET request to ${API_URL}/${searchId.trim()} - Status: ${response.status}`);
      if (response.status === 404) { setSearchError(`Student with ID "${searchId}" not found.`); }
      else if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {/*ignore*/ }
        throw new Error(errorMsg);
      } else {
        const data = await response.json(); console.log("Found student:", data); setSearchedStudent(data); setSearchError(null);
      }
    } catch (err) {
      console.error("--- ERROR during handleSearchById ---:", err);
      setSearchError(err.message || "Failed to fetch student details."); setSearchedStudent(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // --- Pagination Handlers ---
  const handlePreviousPage = () => { if (currentPage > 1) fetchStudents(currentPage - 1); };
  const handleNextPage = () => { fetchStudents(currentPage + 1); };

  // --- Initial Data Load ---
  useEffect(() => { fetchStudents(1); }, []);

  return (
    <div className="App">
      <h1>Student Management</h1>

      {/* Display General Errors */}
      {error && <p className="error-message">{error}</p>}

      {/* --- Add/Edit Form Section --- */}
      <div className="form-section">
        <h2>{editingStudent ? `Edit Student (${editingStudent.studentId})` : 'Add New Student'}</h2>
        <form onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}>
          <div>
            <label htmlFor="studentId">Student ID: </label>
            <input type="text" id="studentId" value={editingStudent ? editingStudent.studentId : newStudentId} onChange={(e) => !editingStudent && setNewStudentId(e.target.value)} required readOnly={!!editingStudent} disabled={!!editingStudent || isSubmitting} />
          </div>
          <div>
            <label htmlFor="name">Name: </label>
            <input type="text" id="name" value={editingStudent ? editingStudent.name : newStudentName} onChange={(e) => editingStudent ? setEditingStudent({ ...editingStudent, name: e.target.value }) : setNewStudentName(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <label htmlFor="program">Program: </label>
            <input type="text" id="program" value={editingStudent ? editingStudent.program : newStudentProgram} onChange={(e) => editingStudent ? setEditingStudent({ ...editingStudent, program: e.target.value }) : setNewStudentProgram(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <label htmlFor="yearLevel">Year Level: </label>
            <input type="text" id="yearLevel" value={editingStudent ? editingStudent.yearLevel : newStudentYearLevel} onChange={(e) => editingStudent ? setEditingStudent({ ...editingStudent, yearLevel: e.target.value }) : setNewStudentYearLevel(e.target.value)} required placeholder="e.g., 1st Year" disabled={isSubmitting} />
            {/* Changed to type="text" for flexibility like "1st Year", backend validation recommended */}
          </div>
          <div className="button-group form-buttons">
            <button type="submit" disabled={isSubmitting || loading}> {editingStudent ? (isSubmitting ? 'Updating...' : 'Update Student') : (isSubmitting ? 'Adding...' : 'Add Student')} </button>
            {editingStudent && (<button type="button" onClick={handleCancelEdit} disabled={isSubmitting}>Cancel Edit</button>)}
          </div>
        </form>
      </div>

      {/* --- Search by ID Section --- */}
      <hr />
      <div className="search-section">
        <h2>Find Student by ID</h2>
        <div className="search-input-group">
          <label htmlFor="searchStudentId">Student ID: </label>
          <input type="text" id="searchStudentId" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Enter Student ID" disabled={searchLoading} />
          <button onClick={handleSearchById} disabled={!searchId.trim() || searchLoading}> {searchLoading ? 'Searching...' : 'Search'} </button>
        </div>
        <div className="search-results">
          {searchLoading && <p>Loading details...</p>}
          {searchError && <p className="error-message">{searchError}</p>}
          {searchedStudent && !searchLoading && !searchError && (
            <div className="student-card">
              <h3>Student Found:</h3>
              <p><strong>ID:</strong> {searchedStudent.studentId}</p>
              <p><strong>Name:</strong> {searchedStudent.name}</p>
              <p><strong>Program:</strong> {searchedStudent.program || 'N/A'}</p>
              <p><strong>Year Level:</strong> {searchedStudent.yearLevel}</p>
            </div>
          )}
        </div>
      </div>
      <hr />

      {/* --- Student List Filter Section --- */}
      <div className="filter-section">
        <h3>Filter Students (Current Page)</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="filterName">Name: </label>
            <input type="text" id="filterName" placeholder="Filter by name..." value={filterName} onChange={(e) => setFilterName(e.target.value)} />
          </div>
          <div className="filter-group">
            <label htmlFor="filterProgram">Program: </label>
            <select id="filterProgram" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
              <option value="">All Programs</option><option value="BSIS">BSIS</option><option value="ACT">ACT</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="filterYear">Year Level: </label>
            <select id="filterYear" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="">All Years</option><option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option><option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option>
            </select>
          </div>
          <button className="button-clear" onClick={() => { setFilterName(''); setFilterProgram(''); setFilterYear(''); }}>Clear Filters</button>
        </div>
      </div>

      {/* --- Student List Section --- */}
      <h2>Student List (Page {currentPage})</h2>
      {loading && !isSubmitting && <p>Loading students...</p>}
      {!loading && students.length === 0 && currentPage === 1 && <p>No students found in database.</p>}
      {!loading && students.length === 0 && currentPage > 1 && <p>No students found on this page.</p>}

      {!loading && students.length > 0 && (
        <div className="list-container">
          {(() => { 
            const filteredStudents = students.filter(student =>
              (!filterName || student.name.toLowerCase().includes(filterName.toLowerCase())) &&
              (!filterProgram || student.program === filterProgram) &&
              (!filterYear || student.yearLevel === filterYear)
            );

            if (filteredStudents.length === 0 && (filterName || filterProgram || filterYear)) {
              return <p>No students match the current filters on this page.</p>;
            }
            // Handle case where filters are clear but list is still empty (already handled above)
            if (filteredStudents.length === 0 && !filterName && !filterProgram && !filterYear) {
              return null; // The "No students found on this page" message above handles this
            }

            return (
              <>
                <ul>
                  {filteredStudents.map((student) => (
                    <li key={student.studentId || student._id}>
                      <span className="student-details"> {student.name} ({student.studentId}) - Program: {student.program || 'N/A'} - Year: {student.yearLevel} </span>
                      <div className="button-group list-buttons">
                        <button onClick={() => handleStartEdit(student)} className="button-edit" disabled={loading || !!editingStudent || isSubmitting}> Edit </button>
                        <button onClick={() => handleDeleteStudent(student.studentId)} className="button-delete" disabled={loading || !!editingStudent || isSubmitting}> Delete </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="pagination-controls">
                  <button onClick={handlePreviousPage} disabled={currentPage <= 1 || loading || isSubmitting}> Previous </button>
                  <span> Page {currentPage} </span>
                  <button onClick={handleNextPage} disabled={loading || isSubmitting || students.length < 10}> Next </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div> 
  );
}

export default App;