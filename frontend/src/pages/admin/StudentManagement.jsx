import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  QrCode,
  Bus,
  MapPin,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import QRCodeDisplay from '../../components/qr/QRCodeDisplay';
import studentService from '../../services/studentService';
import busService from '../../services/busService';
import routeService from '../../services/routeService';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [busFilter, setBusFilter] = useState('ALL');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const initialForm = {
    studentId: '',
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    className: '',
    division: '',
    parentId: '',
    busId: '',
    routeId: '',
    status: 'Active',
  };
  const [formData, setFormData] = useState(initialForm);

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      const [studentsRes, busesRes, routesRes] = await Promise.all([
        studentService.getAllStudents(),
        busService.getAllBuses(),
        routeService.getAllRoutes(),
      ]);

      setStudents(studentsRes.students || []);
      setBuses(busesRes.buses || []);
      setRoutes(routesRes.routes || []);

      // Extract unique parents from populated students, or use default parent ID if available
      const uniqueParents = [];
      const parentMap = new Set();
      (studentsRes.students || []).forEach((s) => {
        if (s.parentId && s.parentId._id && !parentMap.has(s.parentId._id)) {
          parentMap.add(s.parentId._id);
          uniqueParents.push(s.parentId);
        }
      });
      setParents(uniqueParents);
    } catch (err) {
      console.error('Failed to load student management data:', err);
      addToast('Error loading students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentStudentId(null);
    setFormData({
      ...initialForm,
      // Default to first known parent if available
      parentId: parents.length > 0 ? parents[0]._id : '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (student) => {
    setIsEditing(true);
    setCurrentStudentId(student._id);
    setFormData({
      studentId: student.studentId || '',
      name: student.name || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: student.gender || 'Male',
      className: student.className || '',
      division: student.division || '',
      parentId: student.parentId?._id || student.parentId || '',
      busId: student.busId?._id || student.busId || '',
      routeId: student.routeId?._id || student.routeId || '',
      status: student.status || 'Active',
    });
    setIsAddEditOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        className: formData.className.trim(),
        division: formData.division.trim().toUpperCase(),
        parentId: formData.parentId,
        busId: formData.busId || null,
        routeId: formData.routeId || null,
        status: formData.status,
      };

      if (!isEditing) {
        payload.studentId = formData.studentId.trim().toUpperCase();
        await studentService.createStudent(payload);
        addToast('Student registered successfully', 'success');
      } else {
        await studentService.updateStudent(currentStudentId, payload);
        addToast('Student details updated', 'success');
      }

      setIsAddEditOpen(false);
      loadData();
    } catch (err) {
      console.error('Save student error:', err);
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      addToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setFormLoading(true);
    try {
      await studentService.deleteStudent(studentToDelete._id);
      addToast('Student removed from system', 'success');
      setIsDeleteOpen(false);
      setStudentToDelete(null);
      loadData();
    } catch (err) {
      console.error('Delete student error:', err);
      addToast('Failed to delete student', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Filter students based on search and selected class/bus
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.busId?.busNumber && s.busId.busNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = classFilter === 'ALL' || s.className === classFilter;
    const matchesBus = busFilter === 'ALL' || s.busId?._id === busFilter;

    return matchesSearch && matchesClass && matchesBus;
  });

  const uniqueClasses = Array.from(new Set(students.map((s) => s.className))).filter(Boolean);

  return (
    <>
      <DashboardHeader
        title="Student Enrollment & Security Passes"
        subtitle="Manage student rosters, bus assignments, and printable QR transit passes"
      />

      <div className="dashboard-content">
        {/* Header Action Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Search & Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <div className="input-with-icon" style={{ minWidth: '240px', flex: 1 }}>
              <Search size={18} className="input-icon-left" />
              <input
                type="text"
                className="form-control"
                placeholder="Search student name, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '140px' }}
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="ALL">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
              value={busFilter}
              onChange={(e) => setBusFilter(e.target.value)}
            >
              <option value="ALL">All Buses</option>
              {buses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.busNumber} ({b.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Plus size={18} /> Enroll New Student
          </button>
        </div>

        {/* Students Table */}
        {loading ? (
          <LoadingSpinner text="Loading student records..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students match criteria"
            description="Try modifying search keywords or add a new student enrollment."
            action={
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus size={16} /> Enroll First Student
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Class / Div</th>
                  <th>Assigned Bus</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {student.studentId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {student.gender} • Parent: {student.parentId?.name || 'Linked'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        Grade {student.className}-{student.division}
                      </span>
                    </td>
                    <td>
                      {student.busId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Bus size={15} color="var(--secondary-blue)" />
                          <span style={{ fontWeight: 600 }}>{student.busId.busNumber}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {student.routeId ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {student.routeId.routeName}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => {
                            setStudentDetails(student);
                            setIsDetailsOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          title="View QR Code & Pass"
                          style={{ padding: '0.4rem' }}
                        >
                          <QrCode size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="btn btn-outline btn-sm"
                          title="Edit Student"
                          style={{ padding: '0.4rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setIsDeleteOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          title="Delete Student"
                          style={{ padding: '0.4rem', color: 'var(--error)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddEditOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3>{isEditing ? `Edit Student: ${formData.studentId}` : 'Enroll New Student'}</h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  {!isEditing && (
                    <div className="form-group">
                      <label className="form-label">
                        Student ID <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. STU005"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group" style={{ gridColumn: isEditing ? 'span 2' : 'span 1' }}>
                    <label className="form-label">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Aarav Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Date of Birth <span className="req">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Gender <span className="req">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Class / Grade <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 5"
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Division / Section <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. A"
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Parent Account ID <span className="req">*</span>
                  </label>
                  {parents.length > 0 ? (
                    <select
                      className="form-control"
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      required
                    >
                      <option value="">Select linked parent</option>
                      {parents.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="MongoDB ObjectId of parent user"
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      required
                    />
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Assigned Bus</label>
                    <select
                      className="form-control"
                      value={formData.busId}
                      onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                    >
                      <option value="">No bus assigned</option>
                      {buses.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.busNumber} ({b.registrationNumber}) - Cap: {b.capacity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transit Route</label>
                    <select
                      className="form-control"
                      value={formData.routeId}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    >
                      <option value="">No route assigned</option>
                      {routes.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.routeName} ({r.startPoint} → {r.endPoint})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : isEditing ? 'Update Student' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Pass & QR Details Modal */}
      {isDetailsOpen && studentDetails && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Student Pass & QR Identity</h3>
              <button
                onClick={() => setIsDetailsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center' }}>
              {/* Notice: in attendanceController.js, studentId param expects the MongoDB _id of the student */}
              <QRCodeDisplay
                value={studentDetails._id}
                studentName={studentDetails.name}
                studentId={studentDetails.studentId}
                size={190}
              />

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div>
                  <strong>Student ID:</strong> {studentDetails.studentId}
                </div>
                <div>
                  <strong>Internal MongoDB ID:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{studentDetails._id}</span>
                </div>
                <div>
                  <strong>Class:</strong> Grade {studentDetails.className} - {studentDetails.division}
                </div>
                <div>
                  <strong>Assigned Bus:</strong> {studentDetails.busId?.busNumber || 'None'}
                </div>
                <div>
                  <strong>Route:</strong> {studentDetails.routeId?.routeName || 'None'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsDetailsOpen(false)}>
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${studentToDelete?.name}" (${studentToDelete?.studentId})? This will remove all assigned transit mappings.`}
        confirmText="Delete Student"
        loading={formLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setStudentToDelete(null);
        }}
      />
    </>
  );
};

export default StudentManagement;
