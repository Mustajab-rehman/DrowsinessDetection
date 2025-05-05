import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
import tkinter as tk
from tkinter import messagebox

# Load dataset
df = pd.read_csv("accident_data.csv")

# Encode categorical variables
label_encoders = {}
for column in df.columns[:-1]:  # Exclude 'accident' column
    label_encoders[column] = LabelEncoder()
    df[column] = label_encoders[column].fit_transform(df[column])

# Split data
X = df.drop("accident", axis=1)
y = df["accident"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a lightweight model
model = DecisionTreeClassifier(max_depth=3)  # Keeps it lightweight
model.fit(X_train, y_train)

# Function to predict accident risk
def predict_accident():
    weather = weather_var.get()
    road_condition = road_var.get()
    traffic = traffic_var.get()
    time_of_day = time_var.get()

    # Convert input to numerical values
    input_data = [[
        label_encoders["weather"].transform([weather])[0],
        label_encoders["road_condition"].transform([road_condition])[0],
        label_encoders["traffic"].transform([traffic])[0],
        label_encoders["time_of_day"].transform([time_of_day])[0]
    ]]

    prediction = model.predict(input_data)[0]
    result = "High Risk of Accident" if prediction == 1 else "Low Risk of Accident"
    messagebox.showinfo("Prediction Result", result)

# GUI using Tkinter
root = tk.Tk()
root.title("Accident Prediction System")
root.geometry("300x300")

tk.Label(root, text="Weather").pack()
weather_var = tk.StringVar(root)
weather_var.set("Clear")
tk.OptionMenu(root, weather_var, "Clear", "Rain", "Fog").pack()

tk.Label(root, text="Road Condition").pack()
road_var = tk.StringVar(root)
road_var.set("Dry")
tk.OptionMenu(root, road_var, "Dry", "Wet").pack()

tk.Label(root, text="Traffic").pack()
traffic_var = tk.StringVar(root)
traffic_var.set("Low")
tk.OptionMenu(root, traffic_var, "Low", "Medium", "High").pack()

tk.Label(root, text="Time of Day").pack()
time_var = tk.StringVar(root)
time_var.set("Morning")
tk.OptionMenu(root, time_var, "Morning", "Afternoon", "Evening", "Night").pack()

tk.Button(root, text="Predict", command=predict_accident).pack()

root.mainloop()
