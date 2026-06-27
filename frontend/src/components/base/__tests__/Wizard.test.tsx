import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Wizard, { WizardStep } from '../Wizard';

const makeSteps = (count = 3): WizardStep[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `step-${i}`,
    title: `Step ${i + 1} Title`,
    description: `Step ${i + 1} description`,
    content: <div>Content for step {i + 1}</div>,
    isValid: true,
  }));

describe('Wizard', () => {
  const onStepChange = jest.fn();
  const onComplete = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders current step title and description', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    // Title appears in both progress indicator and content header
    expect(screen.getAllByText('Step 1 Title').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Step 1 description').length).toBeGreaterThan(0);
    expect(screen.getByText('Content for step 1')).toBeInTheDocument();
  });

  it('renders step progress indicator with correct count', () => {
    render(
      <Wizard
        steps={makeSteps(3)}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('shows "Next" button on non-last step', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('shows "Generate Itinerary" button on last step', () => {
    const steps = makeSteps(2);
    render(
      <Wizard
        steps={steps}
        currentStep={1}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Generate Itinerary' })
    ).toBeInTheDocument();
  });

  it('calls onStepChange with next step when Next is clicked', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('calls onComplete with completionData on last step Next click', () => {
    const data = { foo: 'bar' };
    const steps = makeSteps(2);
    render(
      <Wizard
        steps={steps}
        currentStep={1}
        onStepChange={onStepChange}
        onComplete={onComplete}
        completionData={data}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Generate Itinerary' }));
    expect(onComplete).toHaveBeenCalledWith(data);
  });

  it('hides Back button on first step', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    expect(
      screen.queryByRole('button', { name: 'Back' })
    ).not.toBeInTheDocument();
  });

  it('shows Back button on non-first step and calls onStepChange', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={1}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it('renders Cancel button when onCancel is provided', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not render Cancel button when onCancel is not provided', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument();
  });

  it('disables Next when isLoading is true', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
        isLoading={true}
      />
    );
    expect(screen.getByRole('button', { name: /Processing/ })).toBeDisabled();
  });

  it('shows Processing spinner when isLoading', () => {
    render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
        isLoading={true}
      />
    );
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('disables Next when step isValid is false', () => {
    const steps = makeSteps();
    steps[0].isValid = false;
    render(
      <Wizard
        steps={steps}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('clicking a completed step header calls onStepChange', () => {
    render(
      <Wizard
        steps={makeSteps(3)}
        currentStep={2}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    // Click on step 1 header (index 0, already completed)
    fireEvent.click(screen.getAllByText('Step 1 Title')[0]);
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it('does not call onStepChange when clicking a future step while current is invalid', () => {
    const steps = makeSteps(3);
    steps[0].isValid = false;
    render(
      <Wizard
        steps={steps}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    // Click step 3 (index 2) — future step, current is invalid
    fireEvent.click(screen.getAllByText('Step 3 Title')[0]);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('renders step numbers in the progress indicator', () => {
    render(
      <Wizard
        steps={makeSteps(3)}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
      />
    );
    // Steps 2 and 3 should show their numbers (step 1 is active, no number shown as text)
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Wizard
        steps={makeSteps()}
        currentStep={0}
        onStepChange={onStepChange}
        onComplete={onComplete}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
