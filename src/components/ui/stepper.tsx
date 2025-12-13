import React, { useState, Children, useRef, useLayoutEffect, HTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    initialStep?: number;
    onStepChange?: (step: number) => void;
    onFinalStepCompleted?: () => void;
    stepCircleContainerClassName?: string;
    stepContainerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
    backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    backButtonText?: string;
    nextButtonText?: string;
    disableStepIndicators?: boolean;
    validateStep?: (step: number) => boolean;
    renderStepIndicator?: (props: {
        step: number;
        currentStep: number;
        onStepClick: (clicked: number) => void;
    }) => ReactNode;
}

export default function Stepper({
    children,
    initialStep = 1,
    onStepChange = () => { },
    onFinalStepCompleted = () => { },
    stepCircleContainerClassName = '',
    stepContainerClassName = '',
    contentClassName = '',
    footerClassName = '',
    backButtonProps = {},
    nextButtonProps = {},
    backButtonText = 'Atrás',
    nextButtonText = 'Continuar',
    disableStepIndicators = false,
    validateStep,
    renderStepIndicator,
    ...rest
}: StepperProps) {
    const [currentStep, setCurrentStep] = useState<number>(initialStep);
    const [direction, setDirection] = useState<number>(0);
    const stepsArray = Children.toArray(children);
    const totalSteps = stepsArray.length;
    const isCompleted = currentStep > totalSteps;
    const isLastStep = currentStep === totalSteps;

    const updateStep = (newStep: number) => {
        setCurrentStep(newStep);
        if (newStep > totalSteps) {
            onFinalStepCompleted();
        } else {
            onStepChange(newStep);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1);
            updateStep(currentStep - 1);
        }
    };

    const handleNext = () => {
        if (validateStep && !validateStep(currentStep)) {
            return;
        }

        if (!isLastStep) {
            setDirection(1);
            updateStep(currentStep + 1);
        }
    };

    const handleComplete = () => {
        if (validateStep && !validateStep(currentStep)) {
            return;
        }
        setDirection(1);
        updateStep(totalSteps + 1);
    };

    return (
        <div className="flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:p-0 w-full" {...rest}>
            <div className={cn("mx-auto w-full max-w-6xl", stepCircleContainerClassName)}>

                {/* Progress Indicators */}
                <div className={cn("flex w-full items-center justify-between px-12 py-8 mb-4 border-b border-white/5", stepContainerClassName)}>
                    {stepsArray.map((_, index) => {
                        const stepNumber = index + 1;
                        const isNotLastStep = index < totalSteps - 1;
                        return (
                            <React.Fragment key={stepNumber}>
                                {renderStepIndicator ? (
                                    renderStepIndicator({
                                        step: stepNumber,
                                        currentStep,
                                        onStepClick: clicked => {
                                            setDirection(clicked > currentStep ? 1 : -1);
                                            updateStep(clicked);
                                        }
                                    })
                                ) : (
                                    <StepIndicator
                                        step={stepNumber}
                                        disableStepIndicators={disableStepIndicators}
                                        currentStep={currentStep}
                                        onClickStep={clicked => {
                                            // Optional: allow navigation only to visited steps or validate first
                                            // For now, simplify to prevent jumping ahead blindly if validation is strict
                                            if (clicked < currentStep) {
                                                setDirection(-1);
                                                updateStep(clicked);
                                            }
                                        }}
                                    />
                                )}
                                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Content Area */}
                <StepContentWrapper
                    isCompleted={isCompleted}
                    currentStep={currentStep}
                    direction={direction}
                    className={cn("space-y-4 px-12 py-6 relative min-h-[400px]", contentClassName)}
                >
                    {stepsArray[currentStep - 1]}
                </StepContentWrapper>

                {/* Footer / Controls */}
                {!isCompleted && (
                    <div className={cn("px-12 pb-8 pt-6 flex justify-between items-center border-t border-white/5 bg-[#1A1A1A]", footerClassName)}>
                        <div className="flex-1">
                            {currentStep !== 1 && (
                                <button
                                    onClick={handleBack}
                                    className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5 rounded-lg"
                                    {...backButtonProps}
                                >
                                    {backButtonText}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={isLastStep ? handleComplete : handleNext}
                                className="bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal px-6 py-2.5 text-sm"
                                {...nextButtonProps}
                            >
                                {isLastStep ? 'Finalizar Registro' : nextButtonText}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface StepContentWrapperProps {
    isCompleted: boolean;
    currentStep: number;
    direction: number;
    children: ReactNode;
    className?: string;
}

function StepContentWrapper({
    isCompleted,
    currentStep,
    direction,
    children,
    className = ''
}: StepContentWrapperProps) {
    const [parentHeight, setParentHeight] = useState<number | 'auto'>('auto');

    return (
        <motion.div
            style={{ position: 'relative', overflow: 'hidden' }}
            animate={{ height: isCompleted ? 0 : parentHeight }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className={className}
        >
            <AnimatePresence initial={false} mode="wait" custom={direction}>
                {!isCompleted && (
                    <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
                        {children}
                    </SlideTransition>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface SlideTransitionProps {
    children: ReactNode;
    direction: number;
    onHeightReady: (height: number) => void;
}

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        // Small delay to allow layout to settle
        const timer = setTimeout(() => {
            if (containerRef.current) {
                onHeightReady(containerRef.current.offsetHeight);
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [children, onHeightReady]);

    return (
        <motion.div
            ref={containerRef}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}

const stepVariants: Variants = {
    enter: (dir: number) => ({
        x: dir >= 0 ? 20 : -20,
        opacity: 0,
        position: 'absolute'
    }),
    center: {
        x: 0,
        opacity: 1,
        position: 'relative'
    },
    exit: (dir: number) => ({
        x: dir >= 0 ? -20 : 20,
        opacity: 0,
        position: 'absolute'
    })
};

interface StepProps {
    children: ReactNode;
}

export function Step({ children }: StepProps) {
    return <div className="w-full h-full">{children}</div>;
}

interface StepIndicatorProps {
    step: number;
    currentStep: number;
    onClickStep: (clicked: number) => void;
    disableStepIndicators?: boolean;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators = false }: StepIndicatorProps) {
    const status = currentStep === step ? 'active' : currentStep > step ? 'complete' : 'inactive';

    const handleClick = () => {
        if (!disableStepIndicators) {
            onClickStep(step);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn("relative flex flex-col items-center gap-2 cursor-pointer outline-none group", disableStepIndicators && "cursor-default")}
        >
            <motion.div
                animate={status}
                initial={false}
                variants={{
                    inactive: { scale: 1, backgroundColor: '#252525', borderColor: 'rgba(255,255,255,0.1)' },
                    active: { scale: 1.1, backgroundColor: '#ffffff', borderColor: '#ffffff' },
                    complete: { scale: 1, backgroundColor: '#313131', borderColor: 'rgba(255,255,255,0.2)' }
                }}
                transition={{ duration: 0.3 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-colors shadow-lg z-10"
            >
                {status === 'complete' ? (
                    <Check className="h-5 w-5 text-green-500" />
                ) : status === 'active' ? (
                    <span className="text-black">{step}</span>
                ) : (
                    <span className="text-gray-500 group-hover:text-gray-300 transition-colors">{step}</span>
                )}
            </motion.div>
            <span className={cn("text-xs font-medium uppercase tracking-wider absolute -bottom-6 w-32 text-center transition-colors",
                status === 'active' ? "text-white" : "text-gray-600"
            )}>
                {/* Label could actully be passed here if we refactor stepper to take step labels */}
            </span>
        </div>
    );
}

interface StepConnectorProps {
    isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
    return (
        <div className="flex-1 h-[2px] bg-[#252525] mx-4 relative overflow-hidden rounded-full">
            <motion.div
                className="absolute left-0 top-0 h-full w-full bg-white/20"
                initial={{ x: '-100%' }}
                animate={{ x: isComplete ? '0%' : '-100%' }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            />
        </div>
    );
}
