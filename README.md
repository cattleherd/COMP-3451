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
