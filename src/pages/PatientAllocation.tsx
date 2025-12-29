import React, { useState } from 'react';

const PatientAllocation = () => {
  const doctors = [
    { id: 1, name: 'Dr. Smith' },
    { id: 2, name: 'Dr. Johnson' },
  ];

  const children = [
    { id: 1, name: 'Rahul', diagnosis: 'Autism' },
    { id: 2, name: 'Sarah', diagnosis: 'General' },
  ];

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    console.log(`Assigned Doctor ${selectedDoctor} to Child ${selectedChild}`);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h2>Patient Allocation</h2>
      <button onClick={() => setIsModalOpen(true)}>Assign Patient</button>

      {isModalOpen && (
        <div className="modal">
          <h3>Assign Patient</h3>
          <label>
            Select Doctor:
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">--Select Doctor--</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.name}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Select Child:
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              <option value="">--Select Child--</option>
              {children.map((child) => (
                <option key={child.id} value={child.name}>
                  {child.name}
                </option>
              ))}
            </select>
          </label>
          <br />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default PatientAllocation;