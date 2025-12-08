import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Interview = () => {
  return (
    <div className="page">
      <div className="grid grid-2">
        <Card>
          <div className="card-header">
            <h3>Start a new interview</h3>
            <span className="card-subtitle">Choose the mode and difficulty</span>
          </div>
          <div className="form-field">
            <label className="form-label">Interview type</label>
            <select className="form-input">
              <option>Behavioral</option>
              <option>Coding</option>
              <option>System Design</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Difficulty</label>
            <select className="form-input">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <Button>Start Interview</Button>
        </Card>

        <Card>
          <div className="card-header">
            <h3>Live feedback preview</h3>
          </div>
          <p className="card-text">
            During an interview we analyse:
          </p>
          <ul className="list">
            <li>🎤 Voice tone &amp; nervousness</li>
            <li>👀 Eye contact &amp; blinking patterns</li>
            <li>🧍‍♂️ Posture &amp; body language</li>
          </ul>
          <div className="chart chart--bars">
            <div className="bar">
              <span>Confidence</span>
              <div className="bar__track">
                <div className="bar__fill bar__fill--primary" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="bar">
              <span>Nervousness</span>
              <div className="bar__track">
                <div className="bar__fill bar__fill--danger" style={{ width: '30%' }} />
              </div>
            </div>
            <div className="bar">
              <span>Eye contact</span>
              <div className="bar__track">
                <div className="bar__fill bar__fill--accent" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Interview;
