import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MentorList from './components/MentorList';
import MenteeList from './components/MenteeList';
import GroupList from './components/GroupList';
import MentorDetail from './components/MentorDetail';
import EditMentor from './components/EditMentor';
import AddMentor from './components/AddMentor';
import MenteeDetail from './components/MenteeDetail';
import EditMentee from './components/EditMentee';
import AddMentee from './components/AddMentee';
import GroupDetail from './components/GroupDetail';
import EditGroup from './components/EditGroup';
import AddGroup from './components/AddGroup';
import ScheduleList from './components/ScheduleList';
import AnalyticsPage from './components/AnalyticsPage';
import TestimonialsPage from './components/TestimonialsPage';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Mentor Routes */}
            <Route path="/mentors" element={<MentorList />} />
            <Route path="/mentors/add" element={<AddMentor />} />
            <Route path="/mentors/:id" element={<MentorDetail />} />
            <Route path="/mentors/:id/edit" element={<EditMentor />} />
            
            {/* Mentee Routes */}
            <Route path="/mentees" element={<MenteeList />} />
            <Route path="/mentees/add" element={<AddMentee />} />
            <Route path="/mentees/:id" element={<MenteeDetail />} />
            <Route path="/mentees/:id/edit" element={<EditMentee />} />
            
            {/* Group Routes */}
            <Route path="/groups" element={<GroupList />} />
            <Route path="/groups/add" element={<AddGroup />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/groups/:id/edit" element={<EditGroup />} />
            
            {/* Other Routes */}
            <Route path="/schedule" element={<ScheduleList />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;