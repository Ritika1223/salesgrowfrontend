import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import websiteRoute from './View/Website/Route'
import userRoute from './View/User/Route'
// import adminRoute from './View/Admin/Route'
import { startIdleLogout } from './utils/auth';
import './View/css/theme.css'
import './View/css/style.css'
import './View/css/theme-apply.css'
// import './View/css/mobile_menu.css'
// import './View/css/responsive.css'
// import './View/css/custom_spacing.css'

function IdleLogout() {
  useEffect(() => startIdleLogout(), []);
  return null;
}

const App = () => {
  return (<>
        <IdleLogout />
        <ToastContainer />
        <RouterProvider router={createBrowserRouter([
          ...websiteRoute,
          ...userRoute,
          // ...adminRoute,
        ])} />
  </>)
}

export default App;
