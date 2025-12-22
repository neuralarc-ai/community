import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer>
            
            {/* Footer Text Section */}
            <div className="bg-black py-6 px-4 sm:px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-white text-sm">
                        {/* Left - Terms of Use and Privacy Policy */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Link 
                                href="/terms-of-use" 
                                className="hover:text-gray-300 transition-colors duration-300"
                            >
                                Terms Of Use
                            </Link>
                            <Link 
                                href="/privacy-policy" 
                                className="hover:text-gray-300 transition-colors duration-300"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                        
                        {/* Center - Copyright */}
                        <div className="text-center">
                            © 2025 Sphere Community Portal. All rights reserved.
                        </div>
                        
                        {/* Right - Product by Neural Arc Inc */}
                        <div className="text-right">
                            Product by{' '}
                            <Link 
                                href="https://neuralarc.ai" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-gray-300 transition-colors duration-300"
                            >
                                Neural Arc Inc
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
