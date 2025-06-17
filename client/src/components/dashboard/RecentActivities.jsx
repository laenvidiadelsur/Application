import React from 'react';
import { Notifications as NotificationsIcon, Delete as DeleteIcon } from '@mui/icons-material';

const RecentActivities = ({ activities, onDeleteActivity }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Actividades Recientes</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Ver todo
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.tempId} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100">
                <NotificationsIcon className="h-5 w-5 text-blue-600" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.message}</p>
              <p className="text-sm text-gray-500">{new Date(activity.time).toLocaleString()}</p>
            </div>
            <button
              onClick={() => onDeleteActivity(activity.tempId)}
              className="inline-flex items-center p-1.5 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <DeleteIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities; 