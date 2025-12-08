import React from 'react';
import Card from '../components/ui/Card';
import InputField from '../components/forms/InputField';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="grid grid-2">
        <Card>
          <div className="card-header">
            <h3>Profile</h3>
          </div>
          <InputField label="Name" defaultValue={user?.name || ''} />
          <InputField label="Email" defaultValue={user?.email || ''} />
          <InputField label="Target role" placeholder="e.g. Backend Engineer" />
          <InputField label="Experience level" placeholder="e.g. 3 years" />
          <Button>Save changes</Button>
        </Card>

        <Card>
          <div className="card-header">
            <h3>Goals</h3>
          </div>
          <p className="card-text">
            Define what you&apos;re preparing for so we can generate better
            questions.
          </p>
          <textarea
            className="form-input"
            rows="6"
            placeholder="Example: I want to prepare for product-based companies, DSA + system design + behavioral..."
          />
          <Button variant="secondary">Update goals</Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
