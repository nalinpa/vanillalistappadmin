# 🛡️ App Admin Portal

The web-based administrative dashboard for managing the mobile app platform. This portal connects to the same Firebase backend as the mobile app, allowing you to manage content, moderate users, and maintain the database.

## 🛠 Tech Stack
* **Framework:** React + Vite (TypeScript)
* **Styling:** Tailwind CSS
* **Backend / Database:** Firebase (Auth, Firestore)
* **Hosting:** Firebase Hosting / Vercel (Configurable)

## ✨ Key Features
* **Entity Management:** Add, edit, or toggle the active status of core database items and their completion checkpoints.
* **Access Control:** Secure admin-only access governed by Firestore rules and dedicated user roles.

---

## 🚀 Getting Started

Follow these steps to set up a new instance of the admin portal from the boilerplate.

### 1. Local Setup
Clone the repository and scaffold your specific entity (e.g., renaming the default template to match your app's data model).

```bash
# Clone the repository into a new folder
git clone [https://github.com/YourUsername/boilerplate-admin.git](https://github.com/YourUsername/boilerplate-admin.git) my-new-admin
cd my-new-admin

# Run the scaffolding script to rename files, folders, and code references
node scaffold.js

# Install dependencies
npm install
2. Firebase Configuration
You need to connect this portal to your mobile app's Firebase project and configure an admin user.

Go to the Firebase Console and select your existing project.

Add a new Web App to the project to generate your configuration keys.

Ensure Authentication (Email/Password) is enabled.

Add a new user in the Authentication tab (this will be your admin login).

Open Firestore Database and create a new collection called admins.

Add a new document to the admins collection:

Document ID: Must exactly match the UID of the user you just created in Auth.

Fields: * email (string): The user's email address.

role (string): "admin"

3. Environment Variables
Create a .env file in the root directory and add your Firebase configuration keys:

Code snippet
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
4. Initialize Your New Git Repository
Disconnect from the boilerplate repository and push to your own new project.  

Bash
# Remove the old connection
git remote remove origin

# Link to your new, empty GitHub repository
git remote add origin [https://github.com/yourusername/YOUR_NEW_REPO_NAME.git](https://github.com/yourusername/YOUR_NEW_REPO_NAME.git)

# Commit the scaffolded baseline
git add .
git commit -m "Initial commit: scaffolded backend and form"
git push -u origin main
5. Running Locally
Start the local development server:

Bash
npm run dev
Open http://localhost:5173 to view the portal and log in with your admin credentials.

👨‍💻 Developer Guide
Updating Region and Category Types
To modify the available dropdown/type options for your entities, update the literal types in your main model file (e.g., src/models/[entity].ts).

How to Add a New Form Field
Adding a new field requires updating the data model, validation, page state, and the UI components. Follow these steps:

1. Update the Model & State
In your model file (src/models/[entity].ts):

Add the new field to the main Type (e.g., [Entity]).

Add the new field to the FormState (e.g., [Entity]FormState).

2. Update Validation
In your admin library file (src/lib/[entity]Admin.ts), update the validate function:

TypeScript
if (!form.newField.trim()) errors.push("New field is required.");
3. Update Page State & Payload
In your main page component (src/pages/[Entity]Page.tsx):

Add the default value to emptyForm.

Update the useEffect block that populates setForm when an item is selected.

Add the parsed field to the basePayload inside the save() function.

4. Update the UI Form
In your form component (src/components/[entity]/[Entity]Form.tsx), add the corresponding <Input /> block:

TypeScript
<div>
  <label className="text-sm font-medium text-slate-700">New Field Name</label>
  <Input
    value={form.newField}
    onChange={(e) => onChangeForm({ ...form, newField: e.target.value })}
    placeholder="e.g. example thing"
  />
  <div className="text-xs text-slate-500 mt-1">
    Contextual help text explaining what this field is used for.
  </div>
</div>