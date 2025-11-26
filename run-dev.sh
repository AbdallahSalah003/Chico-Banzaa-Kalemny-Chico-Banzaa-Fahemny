#!/bin/bash

echo "Starting Backend..."
(cd backend && rails s) &

echo "Starting Frontend..."
(cd frontend && npm run dev)
