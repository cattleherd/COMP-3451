# (COMP 3451) Project Phase 4: Prototyping 
## SomaliLearn Language Learning App 

This is a high-fidelity prototype that is mobile-first. It is best viewed on a mobile device!

---

## Live Demo

A live, web-based version of this prototype is hosted on Vercel:

**https://comp-3451.vercel.app/**

Once again, if you want the best experience its best viewed on a mobile device, and if possible, an android device.

---

## Environment Setup

These steps apply to both **macOS and Windows**.

---

### 1. Prerequisite: Install Node.js

This project uses React Native (Expo), which requires Node.js.

**Download Node.js VERSION 20.19.5 (LTS):**  
https://nodejs.org/en/download

<img width="2551" height="1510" alt="Screenshot (110)" src="https://github.com/user-attachments/assets/430ed080-2af5-4016-9387-60c406a326bd" />

The nodeJS version I was using when developing the app is most compatible with **Node.js VERSION 20.19.5 (LTS)** so please use this version or there WILL be errors.

Make sure to select the correct version (20.19.5) in the dropdown, and select the proper operating system at the bottom, and then download.

- Accept all default installation options. Make sure you choose the operating system.

**To verify installation:**

- **macOS:**  
  Open **Terminal**. (Click the Spotlight icon, then type “Terminal”, then press Enter)

- **Windows:**  
  Open **Command Prompt**. (Press Start, then type “cmd”, then press Enter)

Then type:

```bash
node -v
```
![5](https://github.com/user-attachments/assets/43b0071d-e6e9-4e44-81e1-edb298cb2449)

If you see a version number, Node.js is installed correctly. If you don't, you may need to open a new terminal or command prompt window. If you are running terminal inside an IDE, try restarting the IDE.

---



### 2. Download or Unzip the files


**unzip** the project `.zip` file in the submission attached

**or**

Go to the GitHub page https://github.com/cattleherd/COMP-3451/
<br>
Click the green **Code** button  
Click **Download ZIP**  
Unzip the file.

![6](https://github.com/user-attachments/assets/ad655c55-88a1-4ae8-bf94-755615b3d76c)

### Step 3. Install libraries

Make sure you are **inside the project’s root folder** — this is the folder that contains:

- a `/src` folder  
- a `/public` folder  
- a `package.json` file

Once you are inside this root folder:

- **macOS:** open **Terminal**  
- **Windows:** open **Command Prompt**
  
<img width="2560" height="1600" alt="Screenshot (107)" src="https://github.com/user-attachments/assets/71165eb8-4bf2-4b59-986c-d3dd5b3ea53b" />

Then install the project libraries by typing:

```bash
npm install
```
![npm](https://github.com/user-attachments/assets/835004ed-16d5-4c5a-9fbc-ec9c838f4b72)

This will download and install all required dependencies in the root folder. This is crucial, since the binaries required are different from MacOs or Windows, and this step must be done by you.

---

### 3. Run the Application

This project uses **Expo** to run the app on web or mobile.

**Start the development server:**

1) With an open terminal or command prompt pointed to the root folder, then type:

```bash
npx expo start --web
```
![expo 1](https://github.com/user-attachments/assets/a148a5cd-5529-4048-80b9-fe343cbbe3ec)

![expo 2](https://github.com/user-attachments/assets/23645613-d18a-4c92-b977-50f2ff4a40d8)


Once the build progress bar is complete, the app will open automatically at:

```
http://localhost:8081
```

# Using the App


You will land on the **onboarding screen**, where you complete a short guided introduction to the app.

<img width="778" height="934" alt="image" src="https://github.com/user-attachments/assets/e79a0822-4a1a-4276-99ee-064dd9d56534" />

---

## 2. Complete Onboarding
After completing the onboarding prompts, you will arrive on the **main home page**,

<img width="664" height="1208" alt="image" src="https://github.com/user-attachments/assets/f5ac09e0-5aad-434e-9949-7de9b9e45941" />

---

## 3. Select a Lesson
Click any lesson tile.  
A modal will appear showing:

- A brief description of the lesson
- A “Start Lesson” button

Start the lesson to continue.

<img width="668" height="1168" alt="image" src="https://github.com/user-attachments/assets/29374495-159b-45ab-8463-6d69b3c17592" />


---

## 4. Game Type 1: Flashcard Game
In the Flashcard game, you are shown a word or phrase.

Your task:

- **Tap the correct translation** from the multiple-choice options.

<img width="672" height="1264" alt="image" src="https://github.com/user-attachments/assets/a8b508a0-25b6-4b06-a48e-1fbf9bb81555" />


If you select the wrong answer:

- A feedback modal appears showing the **correct answer**
- You can continue the lesson after reviewing

<img width="656" height="1260" alt="image" src="https://github.com/user-attachments/assets/40c3e7d0-7e42-4a1b-abd7-fbab34f625b1" />

---

## 5. Game Type 2: Dialogue Game
The Dialogue game simulates a simple conversation.

You are presented with:

- A dialogue sentence with missing words
- A **word bank** containing possible answers

<img width="652" height="1250" alt="image" src="https://github.com/user-attachments/assets/b5f84534-638a-4019-968f-269006fea581" />

<img width="656" height="1276" alt="image" src="https://github.com/user-attachments/assets/a24329a8-5922-4298-b4ff-8046139f93e9" />



Your task:

- **Tap the correct words from the word bank** to complete the sentence
- Submit your choice to see whether your selection matches the correct Somali phrasing

If your answer is incorrect:

- A modal highlights the correct word choice
- You can retry or continue to the next dialogue prompt

<img width="652" height="1264" alt="image" src="https://github.com/user-attachments/assets/e6c8fc9c-c049-45b6-acbb-b420b26e01cc" />

---

## 6. Review Missed Questions
After completing all the questions in the lesson, the app automatically identifies any items you answered incorrectly.

You will see a **“Review what you missed”** screen.

<img width="660" height="1258" alt="image" src="https://github.com/user-attachments/assets/64710ceb-ae49-4438-88cb-3f1921337b5b" />

When you tap **Continue**, the app will replay only the questions you got wrong so you can try them again.  

<img width="650" height="1272" alt="image" src="https://github.com/user-attachments/assets/2a788a3f-30c6-4476-9637-f631efc37292" />

---

## 7. Lesson Complete & Score Screen
Once all missed questions have been reviewed, you will reach the **Lesson Complete** screen.

This final screen displays:

- **Your total score** for the lesson  
- A **Continue** button to return to the main page  

<img width="760" height="1208" alt="image" src="https://github.com/user-attachments/assets/0a209c49-fde8-4dca-8d0f-0b7834b1f5be" />

---








