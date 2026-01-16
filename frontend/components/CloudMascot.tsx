"use client";

import { motion } from 'framer-motion';

export function CloudMascot() {
    return (
        <div className="relative inline-block -mt-16">
            <motion.img
                src="/cloud_mascot_eyes.png"
                alt="Cloud Job Mascot"
                width="400"
                height="400"
                className="relative z-10"
                style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))'
                }}
                animate={{
                    y: [0, -25, 0]
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
}
