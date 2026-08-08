import React from 'react'

function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-green-900/30">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <img src="/logo-dark.png" alt="GUBCPC" className="h-10 w-auto opacity-70" />
                <div className="flex flex-col items-center gap-1.5">
                    <p className="text-green-700 text-xs text-center">© 2026 GUB Competitive Programming Community · Green University of Bangladesh</p>
                    <p className="text-green-600/60 text-[11px] text-center font-sans">
                        Developed by{" "}
                        <a href="https://github.com/Shahria-Faysal" target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 transition-colors font-medium">Mohammad Shahria Faysal</a>
                        {" "}&amp;{" "}
                        <a href="https://github.com/jawadhossainmahi" target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 transition-colors font-medium">Jawad Hossain Mahi</a>
                    </p>
                </div>
                <p className="text-green-800 text-xs tracking-[0.2em] uppercase">Think · Code · Solve</p>
            </div>
        </footer>
    )
}

export default Footer