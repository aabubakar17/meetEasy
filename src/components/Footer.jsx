import React from "react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 shadow dark:bg-gray-900 no-overflow-x">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <img
              src="meetEasy_logo_white.png"
              className="h-8"
              alt="meetEasy Logo"
            />
          </a>
          <div className="flex flex-col items-center">
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-orange-100 sm:mb-0 dark:text-gray-400">
              <li className="mr-2">
                <a
                  href="https://www.linkedin.com/in/abubakar-abubakar-46a9141a1/"
                  className="mx-2 text-orange-100 transition-colors duration-300 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-8 h-8 fill-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4.98 3.5C4.98 2.119 6.119 1 7.5 1C8.881 1 10.02 2.119 10.02 3.5C10.02 4.881 8.881 6 7.5 6C6.119 6 4.98 4.881 4.98 3.5ZM7.5 4.5C7.223 4.5 7 4.723 7 5C7 5.277 7.223 5.5 7.5 5.5C7.777 5.5 8 5.277 8 5C8 4.723 7.777 4.5 7.5 4.5ZM3 8.5H12V20H3V8.5ZM14.5 8.5H16.25C16.25 8.5 16.75 8.5 16.75 9.5V11.5H17.5L17.75 13.5H16.75V20H14.5V13.5H14V11.5H14.5V9.5C14.5 8.5 14.5 8.5 14.5 8.5ZM17.5 7.5C18.5523 7.5 19.5 8.44772 19.5 9.5V14.5C19.5 15.5523 18.5523 16.5 17.5 16.5H14.5C13.4477 16.5 12.5 15.5523 12.5 14.5V9.5C12.5 8.44772 13.4477 7.5 14.5 7.5H17.5Z"></path>
                  </svg>
                </a>
              </li>

              <li className="mr-2">
                <a
                  href="https://github.com/aabubakar17"
                  className="mx-2 text-orange-100 transition-colors duration-300 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-400"
                  aria-label="GitHub"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-18"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.683-.217.683-.483 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.153-1.11-1.46-1.11-1.46-.908-.62.069-.608.069-.608 1.004.07 1.533 1.033 1.533 1.033.892 1.529 2.341 1.088 2.91.832.091-.647.35-1.088.637-1.34-2.22-.253-4.555-1.111-4.555-4.944 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.271.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.852.004 1.709.115 2.508.337 1.908-1.294 2.748-1.025 2.748-1.025.546 1.379.202 2.397.099 2.65.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.562 4.935.36.309.68.92.68 1.855 0 1.338-.012 2.421-.012 2.751 0 .269.18.579.688.481A10.005 10.005 0 0022 12c0-5.523-4.477-10-10-10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </li>
            </ul>
            <p className="text-orange-100">
              Connect with me on LinkedIn and GitHub
            </p>
          </div>
        </div>
        <hr className="my-6 border-orange-100 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-center text-sm text-orange-100 sm:text-center dark:text-gray-400">
          &copy; {new Date().getFullYear()} Abubakar Abdihakim Abubakar All
          rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
