import { type NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="text-lg mb-8">The page you are looking for does not exist.</p>
    <Link className="text-blue-500 hover:text-blue-700" href="/">
      Return to Home
    </Link>
  </div>
);

export default NotFound;
