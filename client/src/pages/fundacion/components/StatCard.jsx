import React from 'react';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';

const StatCard = ({ title, value, loading }) => {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={60} height={40} />
        ) : (
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard; 