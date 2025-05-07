import React from 'react';
import { CheckSquare, Calendar, Tag, Flag, Clock } from 'lucide-react';
import '../assets/css/about.css';



const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>
          <CheckSquare className="header-icon" />
          About BGS Todo App
        </h1>
        <p className="subtitle">Organize your tasks, boost your productivity</p>
      </div>

      <section className="app-description">
        <h2>What is BGS Todo?</h2>
        <p>
          BGS Todo is a modern task management application designed to help you
          stay organized and productive. With our intuitive interface and powerful
          features, you can easily manage your daily tasks, set priorities, and
          track your progress.
        </p>
      </section>

      <section className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Calendar className="feature-icon" />
            <h3>Task Management</h3>
            <p>Create, organize, and track your tasks with due dates and reminders</p>
          </div>

          <div className="feature-card">
            <Tag className="feature-icon" />
            <h3>Categories</h3>
            <p>Organize tasks by categories for better management</p>
          </div>

          <div className="feature-card">
            <Flag className="feature-icon" />
            <h3>Priority Levels</h3>
            <p>Set task priorities to focus on what matters most</p>
          </div>

          <div className="feature-card">
            <Clock className="feature-icon" />
            <h3>Due Dates</h3>
            <p>Never miss a deadline with our due date tracking</p>
          </div>
        </div>
      </section>

      <section className="how-to-use">
        <h2>How to Use</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Create an Account</h3>
            <p>Sign up for free and start organizing your tasks</p>
          </div>
          
          <div className="step">
            <span className="step-number">2</span>
            <h3>Add Your Tasks</h3>
            <p>Create tasks with titles, due dates, and priorities</p>
          </div>
          
          <div className="step">
            <span className="step-number">3</span>
            <h3>Organize</h3>
            <p>Group tasks into categories and set priorities</p>
          </div>
          
          <div className="step">
            <span className="step-number">4</span>
            <h3>Track Progress</h3>
            <p>Mark tasks as complete and monitor your productivity</p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <h2>Get in Touch</h2>
        <p>Have questions or suggestions? We'd love to hear from you!</p>
        <a href="mailto:mulengafuture14@gmail.com" className="contact-button">
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default About;