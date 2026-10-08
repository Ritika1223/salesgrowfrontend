import Home from './Pages/Home';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Success from './Pages/Success';
import Contact from './Pages/Contact';
import HeaderPage from './Components/Header';
import About from './Pages/About';
import Income from './Pages/Income';
import Footer from './Components/Footer';
import { Navigate } from 'react-router-dom';

const withHeaderFooter = (Component) => (
    <>
        {/* <HeaderPage /> */}
        <Component />
        {/* <Footer /> */}
    </>
);

const Routes = [
    {
        path: '/',
        element: withHeaderFooter(Login)
    },
    {
        path: '/guest',
        element: <Navigate to="/login" replace />
    },
    {
        path: '/home',
        element: withHeaderFooter(Home)
    },
    {
        path: '/contact',
        element: withHeaderFooter(Contact)
    },
    {
        path: '/income',
        element: withHeaderFooter(Income)
    },
    {
        path: '/about',
        element: withHeaderFooter(About)
    },
    {
        path: '/login',
        element: withHeaderFooter(Login)
    },
    {
        path: '/signup',
        element: withHeaderFooter(Signup)
    },
    {
        path: '/success',
        element: withHeaderFooter(Success)
    },
];

export default Routes;