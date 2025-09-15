const Newsletter = () => {
  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-prose text-center">
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Remind them you care!</h2>

          <p className="mt-4 text-lg text-gray-700">
            Never visit the card isle again & recive personalized thoughtful cards delivered when you need them, directly to your door.
          </p>
        </div>

        <form
          action="#"
          className="mx-auto mt-6 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-center"
        >
          <label htmlFor="Email" className="flex-1">
            <span className="sr-only"> Email </span>

            <input
              type="email"
              id="Email"
              placeholder="Enter your email"
              className="h-12 w-full rounded border-gray-300 shadow-sm"
            />
          </label>

          <button
            type="submit"
            className="h-12 rounded-sm border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:ring-3 focus:outline-hidden"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;