import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import HanziWriter from 'hanzi-writer';

const HanjaCanvas = forwardRef(({ character, onComplete, width = 300, height = 300 }, ref) => {
    const containerRef = useRef(null);
    const writerRef = useRef(null);
    const [mode, setMode] = useState('normal'); // 'normal', 'quiz'

    useEffect(() => {
        if (!containerRef.current || !character) return;

        // Clean up previous instance
        if (writerRef.current) {
            containerRef.current.innerHTML = '';
        }

        // Initialize Writer
        writerRef.current = HanziWriter.create(containerRef.current, character, {
            width,
            height,
            padding: 15,
            strokeColor: '#334155', // slate-700
            radicalColor: '#6b5850', // primary-600
            outlineColor: '#f1f5f9', // slate-100
            drawingColor: '#2d2420',
            drawingWidth: 15,
            showCharacter: false, // hide initially for quiz feeling or just outline
            showOutline: true,
            quizStartStrokeNum: 0,
            onCorrectStroke: function (strokeData) {
                // Optional tracking
            },
            onComplete: function (summaryData) {
                if (onComplete) onComplete(summaryData);
            }
        });

        return () => {
            // Cleanup not strictly necessary for HanziWriter unless hot-reloading
        };
    }, [character, width, height]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        animate: () => {
            if (writerRef.current) {
                setMode('animate');
                writerRef.current.animateCharacter();
            }
        },
        quiz: () => {
            if (writerRef.current) {
                setMode('quiz');
                writerRef.current.quiz();
            }
        },
        show: () => {
            if (writerRef.current) {
                setMode('normal');
                writerRef.current.showCharacter();
                writerRef.current.cancelQuiz();
            }
        }
    }));

    return (
        <div
            ref={containerRef}
            className="bg-white rounded-2xl shadow-inner border border-slate-200 overflow-hidden touch-none"
            style={{ width, height }}
        />
    );
});

HanjaCanvas.displayName = 'HanjaCanvas';

export default HanjaCanvas;
