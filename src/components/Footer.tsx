import React from 'react'

function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-green-900/30">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <img src="/logo-dark.png" alt="GUBCPC" className="h-10 w-auto opacity-70" />
                <p className="text-green-700 text-xs text-center">© 2026 GUB Competitive Programming Community · Green University of Bangladesh</p>
                <p className="text-green-800 text-xs tracking-[0.2em] uppercase">Think · Code · Solve</p>
            </div>
        </footer>
    )
}

export default Footer