import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HeartPulse, User, LogOut, LayoutDashboard, MapPin, Phone, Shield, Clock, PhoneCall, Calendar, AlertCircle, CheckCircle2, ShieldAlert, Truck, AlertTriangle, MessageSquare, X, Send, Loader2, CalendarDays } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

/* Global Interactive Component: Real Live Gemini AI Assistant Overlay Window */
function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your real-time Lava Heal AI Assistant. Ask me anything about symptoms, booking tips, or general medical queries!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage = { sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCme-JgD37MrZf3tpCIKTgkNbctUli91Ao"; 
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        setMessages((prev) => [...prev, { 
          sender: 'bot', 
          text: "AI setup error: Please insert your valid Google Gemini API Key inside App.jsx or your .env file to activate real-time intelligence answers!" 
        }]);
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const response = await model.generateContent(
        `You are Lava Heal Clinical Guide, a friendly and accurate hospital AI assistant. Assist the patient comprehensively. Context query: ${userText}`
      );

      const aiTextResponse = response.response.text() || "I've reviewed your request but could not compute a clear answer. Please double-check with our front desk specialists.";
      setMessages((prev) => [...prev, { sender: 'bot', text: aiTextResponse }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: "Sorry, I ran into an operational latency error connecting to my core servers. Please verify your API network connection and key configurations." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="chatbot-trigger">
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chat-header">
            <div className="chat-title">
              <div className="online-dot"></div>
              <span>Lava Heal Live AI Guide</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="chat-close">
              <X size={16} />
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`msg ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="msg bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-footer">
            <input 
              type="text" 
              placeholder={isLoading ? "Generating response..." : "Ask symptoms..."}
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-send" disabled={isLoading}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* Sticky Header Context Navigation */
function Navbar({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-area">
        <HeartPulse size={24} className="logo-accent" />
        <span>LAVA <span className="logo-accent">HEAL</span></span>
      </Link>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/doctors">Doctors</Link>
        {user && user.role === 'doctor' ? (
          <Link to="/appointment" style={{color: 'var(--success)', fontWeight: 'bold'}}>Review Requests</Link>
        ) : (
          <Link to="/appointment">Book Appointment</Link>
        )}
        <Link to="/emergency" className="nav-emergency-btn">Emergency SOS</Link>
      </div>

      <div className="profile-container">
        {user ? (
          <div>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="avatar-btn">
              <User size={18} />
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-info">
                  User: <span>{user.fullname}</span>
                  Role: <span style={{color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 'bold'}}>{user.role}</span>
                </div>
                <Link to={user.role === 'doctor' ? '/dashboard-doctor' : '/dashboard-patient'} onClick={() => setDropdownOpen(false)} className="dropdown-item">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button onClick={handleLogoutClick} className="dropdown-item signout">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-actions">
            <Link to="/auth" className="login-link">Login</Link>
            <Link to="/auth?signup=true" className="signup-btn">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

/* Home Section Component */
function Home() {
  const hospitals = [
    { 
      name: "Apollo Shine Hospital Lavasa", 
      location: "Dasve, Lavasa, Maharashtra 412112", 
      phone: "+91 8045678910", 
      link: "https://www.google.com/maps/search/?api=1&query=Apollo+Shine+Hospital+Lavasa+Dasve",
      image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
    },
    { 
      name: "Pirangut Healthcare Center", 
      location: "Pirangut, Maharashtra 412115", 
      phone: "+91 9988776655", 
      link: "https://www.google.com/maps/search/?api=1&query=Government+Rural+Hospital+Pirangut",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
    },
    { 
      name: "Apollo Hospital Pune", 
      location: "Pune, Maharashtra", 
      phone: "+91 9123456789", 
      link: "https://www.google.com/maps/search/?api=1&query=Apollo+Hospitals+Pune",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="home-container">
      <section className="hero-banner">
        <h1>Smart Healthcare Delivery Framework</h1>
        <p>Connecting patients with verified medical experts, real-time clinical consultations, and instant critical care responses through a unified diagnostic engine.</p>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>About LAVA HEAL</h2>
          <p>LAVA HEAL is a dedicated digital clinical workflow system engineered to bridge the gap between regional healthcare facilities and patients. By optimizing specialized care availability, offering real-time data sync for scheduling management, and enforcing instant validation checks for emergency telemetry dispatches, LAVA HEAL coordinates healthcare tracking with absolute transparency and reliability.</p>
        </div>
      </section>

      <h2 className="section-title">Nearest Emergency Medical Facilities</h2>
      <section className="hospitals-grid">
        {hospitals.map((h, i) => (
          <div key={i} className="hospital-card">
            <img src={h.image} alt={h.name} className="hospital-image" />
            <div className="hospital-details">
              <div>
                <h3>{h.name}</h3>
                <div className="hospital-meta">
                  <MapPin size={14} /> <span>{h.location}</span>
                </div>
                <div className="hospital-meta">
                  <Phone size={14} /> <span>{h.phone}</span>
                </div>
              </div>
              <a href={h.link} target="_blank" rel="noreferrer" className="direction-btn">
                <MapPin size={14} /> Get Directions
              </a>
            </div>
          </div>
        ))}
      </section>

      <h2 className="section-title">Patient Testimonials</h2>
      <section className="reviews-section">
        <div className="review-card">
          <div className="stars">★★★★★</div>
          <p className="review-text">"The strict verification layout helped schedule my consultation seamlessly, and the doctor managed the timeline updates accurately. Highly recommended platform transparency!"</p>
          <span className="reviewer-name">— Amit Deshmukh</span>
        </div>
      </section>
    </div>
  );
}

/* Doctors Section Component */
function Doctors() {
  const navigate = useNavigate();
  const doctorsList = [
    { id: "1", name: "Dr. Ayesha Desai", specialty: "Cardiology", certification: "MBBS, MD Cardiology", experience: "12 Years", hours: "Mon - Fri | 10 AM - 5 PM", contact: "+91 9876543210", hospital: "Apollo Hospital Pune" },
    { id: "2", name: "Dr. Rohit Sharma", specialty: "Neurology", certification: "MBBS, DM Neurology", experience: "10 Years", hours: "Mon - Sat | 11 AM - 6 PM", contact: "+91 9988776655", hospital: "Pirangut Healthcare Center" },
    { id: "3", name: "Dr. Priya Kulkarni", specialty: "Dermatology", certification: "MBBS, MD Dermatology", experience: "8 Years", hours: "Tue - Sun | 9 AM - 3 PM", contact: "+91 9123456789", hospital: "Apollo Shine Hospital Lavasa" }
  ];

  return (
    <div className="home-container">
      <div className="doctors-header">
        <h1>Our Specialist Doctors</h1>
        <p>Certified medical professionals ready to evaluate and optimize your standard of health.</p>
      </div>

      <div className="hospitals-grid">
        {doctorsList.map((doc) => (
          <div key={doc.id} className="hospital-card">
            <div style={{ padding: '1.5rem' }}>
              <span className="doctor-badge">{doc.specialty}</span>
              <h2 style={{margin: '1rem 0 0.25rem 0', fontSize: '1.4rem'}}>{doc.name}</h2>
              <p className="hospital-meta" style={{marginBottom: '1.5rem'}}><Shield size={12} /> {doc.certification} ({doc.experience} Exp)</p>
              
              <div style={{borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem'}} className="hospital-meta">
                <Clock size={14} /> <span>{doc.hours}</span>
              </div>
              <div className="hospital-meta" style={{marginBottom: '1rem'}}>
                <PhoneCall size={14} /> <span>{doc.contact}</span>
              </div>
              <div style={{color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic'}}>{doc.hospital}</div>
              
              <button onClick={() => navigate(`/appointment?doctor=${encodeURIComponent(doc.name)}`)} className="submit-btn" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'}}>
                <Calendar size={14} /> Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Unified Appointment Router Page */
function BookAppointment({ user, appointments, setAppointments }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullname: user ? user.fullname : '',
    phone: user ? user.phone : '',
    doctor: '',
    date: '',
    location: 'Apollo Shine Hospital Lavasa'
  });

  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, fullname: user.fullname, phone: user.phone }));
    }
    const docParam = searchParams.get('doctor');
    if (docParam) {
      setFormData((prev) => ({ ...prev, doctor: docParam }));
    }
  }, [searchParams, user]);

  const updateStatus = (id, nextStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: nextStatus } : a));
  };

  const handleReschedule = (id) => {
    const d = prompt("Provide alternate operational clinic date parameter (YYYY-MM-DD):");
    if (d) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, date: d, status: 'Rescheduled' } : a));
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Access Denied. You must log in before completing an appointment reservation.');
      return;
    }
    if (!formData.doctor || !formData.date || !formData.fullname || !formData.phone) {
      setErrorMessage('Please completely fill out all patient information fields.');
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalConfirm = () => {
    const trackingId = "A-" + Math.floor(100 + Math.random() * 900);
    const newRecord = {
      id: trackingId,
      doctorName: formData.doctor,
      date: formData.date,
      facility: formData.location,
      status: "Pending",
      patientName: formData.fullname,
      patientPhone: formData.phone
    };
    
    setAppointments([newRecord, ...appointments]);
    setIsConfirming(false);
    navigate('/dashboard-patient');
  };

  if (user && user.role === 'doctor') {
    return <DashboardDoctor appointments={appointments} setAppointments={setAppointments} />;
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Schedule Session Slot</h2>
        
        {errorMessage && (
          <div className="alert-box alert-danger">
            <AlertCircle size={14} style={{flexShrink: 0}} />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isConfirming ? (
          <form onSubmit={handlePreSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required value={formData.fullname} readOnly className="form-control" placeholder="Log in to complete profile" />
            </div>

            <div className="form-group">
              <label>Mobile Contact Number</label>
              <input type="text" required value={formData.phone} readOnly className="form-control" placeholder="Log in to complete profile" />
            </div>

            <div className="form-group">
              <label>Select Medical Professional</label>
              <select value={formData.doctor} onChange={(e) => setFormData({...formData, doctor: e.target.value})} className="form-control">
                <option value="">-- Choose Practitioner --</option>
                <option value="Dr. Ayesha Desai">Dr. Ayesha Desai (Cardiology)</option>
                <option value="Dr. Rohit Sharma">Dr. Rohit Sharma (Neurology)</option>
                <option value="Dr. Priya Kulkarni">Dr. Priya Kulkarni (Dermatology)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Clinic Site Facility</label>
              <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="form-control">
                <option value="Apollo Shine Hospital Lavasa">Apollo Shine Hospital Lavasa</option>
                <option value="Pirangut Healthcare Center">Pirangut Healthcare Center</option>
                <option value="Apollo Hospital Pune">Apollo Hospital Pune</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Appointment Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="form-control" />
            </div>

            <button type="submit" className="submit-btn">Initialize Validation Step</button>
          </form>
        ) : (
          <div style={{textAlign: 'center'}}>
            <div className="alert-confirmation">
              <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', justifyContent:'center'}}><CheckCircle2 size={16}/> Reconfirm Details</h3>
              <div className="confirm-row"><span>Patient Name:</span> <strong>{formData.fullname}</strong></div>
              <div className="confirm-row"><span>Mobile No:</span> <strong>{formData.phone}</strong></div>
              <div className="confirm-row"><span>Doctor:</span> <strong>{formData.doctor}</strong></div>
              <div className="confirm-row"><span>Facility:</span> <strong>{formData.location}</strong></div>
              <div className="confirm-row"><span>Selected Date:</span> <strong>{formData.date}</strong></div>
            </div>

            <div className="flex-btn-group">
              <button onClick={() => setIsConfirming(false)} className="btn-secondary">Modify</button>
              <button onClick={handleFinalConfirm} className="btn-success">Confirm & Book</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Patient Dashboard Panel View */
function DashboardPatient({ appointments, setAppointments }) {
  const handleCancel = (id) => {
    if (window.confirm("Verify appointment cancellation request?")) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    }
  };

  const handleReschedule = (id) => {
    const d = prompt("Enter alternate scheduling calendar date (YYYY-MM-DD):");
    if (d) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, date: d, status: 'Rescheduled' } : a));
    }
  };

  return (
    <div className="dashboard-wrapper">
      <h1 style={{fontSize:'1.8rem', marginBottom:'0.2rem'}}>Patient Dashboard</h1>
      <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Review current status matrix fields for registered clinical medical requests.</p>
      
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Practitioner</th>
              <th>Target Date</th>
              <th>Facility Site</th>
              <th>Status</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', color:'var(--text-muted)'}}>No appointment parameters submitted yet.</td></tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id}>
                  <td style={{fontFamily:'mono', color:'var(--text-muted)'}}>{appt.id}</td>
                  <td style={{fontWeight: 600}}>{appt.doctorName}</td>
                  <td>{appt.date}</td>
                  <td style={{color:'var(--text-muted)'}}>{appt.facility}</td>
                  <td>
                    <span className={`status-badge ${
                      appt.status === 'Confirmed' ? 'status-confirmed' : 
                      appt.status === 'Pending' ? 'status-pending' : 
                      appt.status === 'Rescheduled' ? 'status-rescheduled' : 'status-cancelled'
                    }`}>{appt.status}</span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    {appt.status !== 'Cancelled' && (
                      <div style={{display:'inline-flex', gap:'0.25rem'}}>
                        <button onClick={() => handleReschedule(appt.id)} className="action-inline-btn">Reschedule</button>
                        <button onClick={() => handleCancel(appt.id)} className="action-inline-btn delete">Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Doctor Administration Panel View */
function DashboardDoctor({ appointments, setAppointments }) {
  const updateStatus = (id, nextStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: nextStatus } : a));
  };

  const handleReschedule = (id) => {
    const d = prompt("Provide alternate operational clinic tracking date (YYYY-MM-DD):");
    if (d) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, date: d, status: 'Rescheduled' } : a));
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <div>
          <h1 style={{fontSize:'1.8rem', marginBottom:'0.2rem'}}>Clinical Appointment Manager</h1>
          <p style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Review incoming medical queue requests and confirm schedules dynamically.</p>
        </div>
        <span className="doctor-badge" style={{padding:'0.5rem 1rem'}}>Logged In Practitioner View</span>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Queue ID</th>
              <th>Patient Name</th>
              <th>Contact Phone</th>
              <th>Allocated Date</th>
              <th>System Status</th>
              <th style={{textAlign: 'right'}}>Workflow Operations</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', color:'var(--text-muted)'}}>Queue empty. No patient registrations detected.</td></tr>
            ) : (
              appointments.map((item) => (
                <tr key={item.id}>
                  <td style={{fontFamily:'mono', color:'var(--text-muted)'}}>{item.id}</td>
                  <td style={{fontWeight: 600}}>{item.patientName || "Walk-in Patient"}</td>
                  <td style={{fontFamily:'mono'}}>{item.patientPhone || "+91 9999999999"}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`status-badge ${
                      item.status === 'Confirmed' ? 'status-confirmed' : 
                      item.status === 'Pending' ? 'status-pending' : 
                      item.status === 'Rescheduled' ? 'status-rescheduled' : 'status-cancelled'
                    }`}>{item.status}</span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    {item.status !== 'Cancelled' ? (
                      <div style={{display:'inline-flex', gap:'0.25rem'}}>
                        {item.status !== 'Confirmed' && (
                          <button onClick={() => updateStatus(item.id, 'Confirmed')} className="action-inline-btn" style={{backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid #10B981'}}>Approve</button>
                        )}
                        <button onClick={() => handleReschedule(item.id)} className="action-inline-btn">Reschedule</button>
                        <button onClick={() => updateStatus(item.id, 'Cancelled')} className="action-inline-btn delete">Cancel</button>
                      </div>
                    ) : (
                      <span style={{color:'var(--text-muted)', fontSize:'0.75rem'}}>No action available</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Emergency Dispatch Infrastructure Trigger */
function EmergencySos() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const handleValidationCheck = (e) => {
    e.preventDefault();
    setValidationError('');
    const indiaMobileRegex = /^(?:\+91|91)?[6789]\d{9}$/;
    if (!indiaMobileRegex.test(phoneNumber.trim())) {
      setValidationError('Invalid Format. Please input a structured 10-digit Indian telephone parameter (e.g., +91 9876543210).');
      return;
    }
    setIsPendingConfirmation(true);
  };

  return (
    <div className="form-container" style={{maxWidth: '480px'}}>
      <div className="form-card" style={{borderTop: '4px solid var(--danger)'}}>
        <h2 style={{display:'flex', alignItems:'center', gap:'0.5rem', justifyContent:'center'}}><ShieldAlert style={{color:'var(--danger)'}} /> Emergency SOS Hub</h2>
        <p style={{fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center', marginBottom:'1.5rem'}}>Instantly coordinate emergency telemetry channels down directly to your position vector.</p>

        {validationError && (
          <div className="alert-box alert-danger">
            <AlertTriangle size={14} style={{flexShrink:0}} />
            <span>{validationError}</span>
          </div>
        )}

        {!isPendingConfirmation && !isDispatched && (
          <form onSubmit={handleValidationCheck}>
            <div className="form-group">
              <label>Registered Contact Number (+91 India)</label>
              <input type="text" placeholder="+91 XXXXX XXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="form-control" style={{fontFamily:'mono', fontSize:'1rem'}}/>
            </div>
            <button type="submit" className="submit-btn" style={{backgroundColor:'var(--danger)'}}>Trigger Dispatch Pipeline</button>
          </form>
        )}

        {isPendingConfirmation && (
          <div style={{textAlign:'center'}}>
            <div className="alert-confirmation" style={{border: '1px solid rgba(239,68,68,0.3)'}}>
              <h4 style={{color:'var(--danger)', fontSize:'0.85rem', marginBottom:'0.5rem', fontWeight:'700'}}>CRITICAL WARNING CONFIRMATION</h4>
              <p style={{fontSize:'0.75rem', color: 'var(--text-muted)'}}>You are initializing a live responder asset dispatch to your current GPS coordinates. Confirm to proceed.</p>
              <p style={{fontFamily:'mono', marginTop:'0.5rem', color:'white', fontSize:'0.8rem'}}>Target Number: {phoneNumber}</p>
            </div>
            <div className="flex-btn-group">
              <button onClick={() => setIsPendingConfirmation(false)} className="btn-secondary">Abort</button>
              <button onClick={() => { setIsPendingConfirmation(false); setIsDispatched(true); }} className="btn-success" style={{backgroundColor:'var(--danger)'}}>Confirm Dispatch</button>
            </div>
          </div>
        )}

        {isDispatched && (
          <div style={{textAlign:'center', padding:'1rem 0'}}>
            <div style={{width:'60px', height:'60px', backgroundColor:'rgba(16,185,129,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem auto', color:'var(--success)', border:'1px solid rgba(16,185,129,0.2)'}}>
              <Truck size={28} />
            </div>
            <h3 style={{fontSize:'1.3rem', marginBottom:'0.25rem'}}>Ambulance Dispatched</h3>
            <p style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Telemetry pipeline synced. Arrival metric calculated at: <span style={{color:'var(--success)', fontWeight:'600'}}>5 - 10 Minutes</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Auth Gateway Identity Verification System */
function AuthGateway({ onLoginSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({ fullname: '', phone: '', password: '' });

  useEffect(() => {
    setIsSignUp(searchParams.get('signup') === 'true');
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({
      fullname: formData.fullname || "Anonymous Node",
      phone: formData.phone,
      role: role
    });
    // Reroute straight to corresponding home console layout
    navigate(role === 'doctor' ? '/appointment' : '/');
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>{isSignUp ? 'Create Profile' : 'Access Gateway Secure'}</h2>
        <div className="auth-role-selector">
          <button type="button" onClick={() => setRole('patient')} className={`role-tab ${role === 'patient' ? 'active' : ''}`}>I am a Patient</button>
          <button type="button" onClick={() => setRole('doctor')} className={`role-tab ${role === 'doctor' ? 'active' : ''}`}>I am a Doctor</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Amit Deshmukh"
              value={formData.fullname} 
              onChange={(e) => setFormData({...formData, fullname: e.target.value})} 
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Mobile Contact Number</label>
            <input 
              type="text" 
              required 
              placeholder="+91 India Code"
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Security Access Token Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              className="form-control"
            />
          </div>
          <button type="submit" className="submit-btn">
            {isSignUp ? 'Confirm Registration' : 'Initialize Session Uplink'}
          </button>
        </form>
        <div style={{textAlign:'center', marginTop:'1rem'}}>
          {isSignUp ? (
            <Link to="/auth" style={{fontSize:'0.8rem', color:'var(--primary)'}}>Already registered? Access here</Link>
          ) : (
            <Link to="/auth?signup=true" style={{fontSize:'0.8rem', color:'var(--primary)'}}>Need a health profile token? Sign up</Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* Master Root App Framework Orchestration */
export default function App() {
  const [user, setUser] = useState(null);
  
  // Pre-seed some default tracking state for demo execution purposes
  const [appointments, setAppointments] = useState([
    { id: "A-521", doctorName: "Dr. Priya Kulkarni", date: "2026-06-02", facility: "Apollo Shine Hospital Lavasa", status: "Confirmed", patientName: "Rahul Verma", patientPhone: "+91 9898989898" },
    { id: "A-844", doctorName: "Dr. Ayesha Desai", date: "2026-06-14", facility: "Apollo Hospital Pune", status: "Pending", patientName: "Pooja Hegde", patientPhone: "+91 9797979797" }
  ]);

  const handleLogin = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="app-shell">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="content-viewport">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointment" element={<BookAppointment user={user} appointments={appointments} setAppointments={setAppointments} />} />
            <Route path="/dashboard-patient" element={<DashboardPatient appointments={appointments} setAppointments={setAppointments} />} />
            <Route path="/dashboard-doctor" element={<DashboardDoctor appointments={appointments} setAppointments={setAppointments} />} />
            <Route path="/emergency" element={<EmergencySos />} />
            <Route path="/auth" element={<AuthGateway onLoginSuccess={handleLogin} />} />
          </Routes>
        </main>

        <AIChatbot />
      </div>
    </Router>
  );
}