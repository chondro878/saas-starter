export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white lg:grid lg:grid-cols-5">
      {/* Image container */}
      <div className="relative block h-64 lg:col-span-2 lg:h-auto">
        <img
          alt="Company"
          src="/footerimg.png"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      {/* Content section */}
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:col-span-3 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Keep in Touch:</p>
            <p className="mt-2 text-sm">Need a rain check?</p>
            <form className="mt-4 max-w-md space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-white bg-transparent p-2 text-sm text-white placeholder-white focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-md border border-white bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-opacity-90"
              >
                Join
              </button>
            </form>
          </div>

          <div>
            <p className="text-sm font-medium">About Us:</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="hover:opacity-75">Who are we?</a></li>
              <li><a href="#" className="hover:opacity-75">Who arn't we?</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium">Need an Assist: </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="hover:opacity-75">FAQ</a></li>
              <li><a href="#" className="hover:opacity-75">Get Help</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-6 text-sm flex flex-col sm:flex-row sm:justify-between text-white/60">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Terms & Conditions</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
          <p className="mt-4 sm:mt-0">&copy; 2025 Avoid the Rain LLC.</p>
        </div>
      </div>
    </footer>
  );
}