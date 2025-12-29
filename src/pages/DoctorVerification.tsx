import React, { useState } from 'react';

const DoctorVerification = () => {
  const mockDoctors = [
    { id: 1, name: 'Dr. Smith', licenseNumber: 'NMC-12345', status: 'Pending' },
    { id: 2, name: 'Dr. Johnson', licenseNumber: 'NMC-67890', status: 'Pending' },
    { id: 3, name: 'Dr. Lee', licenseNumber: 'NMC-54321', status: 'Pending' },
  ];

  const [doctors, setDoctors] = useState(mockDoctors);

  const approveDoctor = (id) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === id ? { ...doctor, status: 'Approved' } : doctor
      )
    );
    alert('Doctor approved successfully!');
  };

  return (
    <div>
      <h2>Doctor Verification</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>License Number</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.name}</td>
              <td>{doctor.licenseNumber}</td>
              <td>{doctor.status}</td>
              <td>
                {doctor.status === 'Pending' && (
                  <button onClick={() => approveDoctor(doctor.id)}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorVerification;