# How to Change Admin Credentials

Since the website is hosted on Vercel, the admin usernames and passwords are saved securely as "Environment Variables" in your Vercel project settings. 

You do **not** need to change anything on Render, as the Admin Panel runs directly from the Vercel frontend.

Here are the step-by-step instructions to update your Admin Panel login details:

### Step 1: Log in to Vercel
Go to [vercel.com](https://vercel.com/) and log into your account.

### Step 2: Select the Project
From your main Vercel dashboard, click on the project name for your website (`store-vault`).

### Step 3: Go to Settings
In the top menu bar of your project view, click on the **Settings** tab.

### Step 4: Navigate to Environment Variables
On the left-hand sidebar menu, click on **Environment Variables**.

### Step 5: Find the Credentials
Scroll down to see the list of your existing environment variables. You will see these keys for the admin accounts:
- `VITE_ADMIN_USERNAME`
- `VITE_ADMIN_PASSWORD`
- `VITE_ADMIN2_USERNAME` (for the second admin)
- `VITE_ADMIN2_PASSWORD` (for the second admin)

### Step 6: Edit the Values
1. Click the three dots (`...`) next to the variable you want to change (for example, `VITE_ADMIN_PASSWORD`).
2. Select **Edit**.
3. Type in your new desired password or username in the Value box.
4. Click **Save**.
5. Repeat this for any other credential variables you wish to update.

### Step 7: Redeploy to Apply Changes
*(Important: Vercel requires a fresh deployment for the new Environment Variables to take effect!)*
1. Go to the **Deployments** tab from the top menu bar.
2. Click the three dots (`...`) next to the most recent deployment at the top of the list.
3. Select **Redeploy** from the dropdown menu.
4. Wait 1-2 minutes for the deployment to finish.

Once the redeployment is complete, your new admin credentials will be fully active on the live website!
