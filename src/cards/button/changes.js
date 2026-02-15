import { getButtonType } from "./helpers.js";
import { 
  getState,
  isStateOn,
  isStateRequiringAttention,
  setLayout,
} from '../../tools/utils.js';
import { updateSlider } from '../../components/slider/changes.js';
import { handleCustomStyles } from '../../tools/style-processor.js';

// Track color change timing per context to optimize Safari transitions
const colorChangeTimers = new WeakMap();

function applyColorChange(context, newButtonColor, newOpacity, cardType) {
  const background = context.elements?.background;
  if (!background) return;
  
  // Glass fork: set on mainContainer so --bubble-accent-color resolves
  // in the same scope where user YAML styles define it
  const target = context.elements?.mainContainer
    || (cardType === 'button' ? context.card : context.popUp);
  if (!target) return;
  
  // Apply the color change
  target.style.setProperty('--bubble-button-background-color', newButtonColor);
  background.style.opacity = newOpacity;
}

export function changeButton(context) {
  const cardType = context.config.card_type;
  const buttonType = getButtonType(context);
  const isOn = isStateOn(context);
  const requiresAttention = isStateRequiringAttention(context);

  const colorTarget = context.elements?.mainContainer
      || (cardType === 'button' ? context.card : context.popUp);
  const currentButtonColor = colorTarget?.style.getPropertyValue('--bubble-button-background-color') ?? '';
  const currentOpacity = context.elements.background?.style.opacity;

  let newButtonColor = '';
  let newOpacity = '';

  if (buttonType === 'switch' && isOn) {
    if (requiresAttention) {
      newButtonColor = 'var(--red-color, var(--error-color))';
      newOpacity = '1';
    } else {
      // Glass fork: always use accent color for ON state
      newButtonColor = 'var(--bubble-button-accent-color, var(--bubble-accent-color, var(--bubble-default-color)))';
      newOpacity = '1';
    }
  } else {
    newButtonColor = 'rgba(0, 0, 0, 0)';
    newOpacity = '.5';
  }

  if (buttonType === 'slider') {
    // All slider logic (including style updates) is handled in slider/changes.js
    updateSlider(context);
  }

  // Only update if color or opacity changed
  if (currentButtonColor !== newButtonColor || currentOpacity !== newOpacity) {
    applyColorChange(context, newButtonColor, newOpacity, cardType);
  }
}

export function changeStatus(context) {
  const state = getState(context);
  const cardType = context.config.card_type;

  if (state === 'unavailable') {
      if (cardType === 'button') {
          context.card.classList.add('is-unavailable');
      } else if (cardType === 'pop-up') {
          context.elements.headerContainer.classList.add('is-unavailable');
      }
  } else {
      if (cardType === 'button') {
          context.card.classList.remove('is-unavailable');
      } else if (cardType === 'pop-up') {
          context.elements.headerContainer.classList.remove('is-unavailable');
      }
  }
}

export function changeStyle(context) {
    setLayout(context);
    handleCustomStyles(context);
}