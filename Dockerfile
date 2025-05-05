FROM python:3.9-slim

# Install system packages needed to build dlib
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy your code into the container
COPY . /app

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port (used by Flask)
EXPOSE 8000

# Start your Flask app
CMD ["python", "app.py"]

