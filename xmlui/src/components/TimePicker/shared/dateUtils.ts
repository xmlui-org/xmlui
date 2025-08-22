// Simple date utility functions to replace @wojtekmaj/date-utils

export function getHours(dateOrTimeString: string | Date | null | undefined): number {
  if (!dateOrTimeString) return 0;
  
  if (dateOrTimeString instanceof Date) {
    return dateOrTimeString.getHours();
  }
  
  // Handle time string format like "14:30:45" or "14:30"
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 1) {
    const hours = parseInt(timeParts[0], 10);
    return isNaN(hours) ? 0 : hours;
  }
  
  return 0;
}

export function getMinutes(dateOrTimeString: string | Date | null | undefined): number {
  if (!dateOrTimeString) return 0;
  
  if (dateOrTimeString instanceof Date) {
    return dateOrTimeString.getMinutes();
  }
  
  // Handle time string format like "14:30:45" or "14:30"
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 2) {
    const minutes = parseInt(timeParts[1], 10);
    return isNaN(minutes) ? 0 : minutes;
  }
  
  return 0;
}

export function getSeconds(dateOrTimeString: string | Date | null | undefined): number {
  if (!dateOrTimeString) return 0;
  
  if (dateOrTimeString instanceof Date) {
    return dateOrTimeString.getSeconds();
  }
  
  // Handle time string format like "14:30:45"
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 3) {
    const seconds = parseInt(timeParts[2], 10);
    return isNaN(seconds) ? 0 : seconds;
  }
  
  return 0;
}

export function getHoursMinutes(dateOrTimeString: string | Date | null | undefined): string {
  if (!dateOrTimeString) return '';
  
  if (dateOrTimeString instanceof Date) {
    const hours = dateOrTimeString.getHours().toString().padStart(2, '0');
    const minutes = dateOrTimeString.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // Handle time string - return first two components
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 2) {
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  return timeString;
}

export function getHoursMinutesSeconds(dateOrTimeString: string | Date | null | undefined): string {
  if (!dateOrTimeString) return '';
  
  if (dateOrTimeString instanceof Date) {
    const hours = dateOrTimeString.getHours().toString().padStart(2, '0');
    const minutes = dateOrTimeString.getMinutes().toString().padStart(2, '0');
    const seconds = dateOrTimeString.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Handle time string - ensure it has three components
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 3) {
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);
    
    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  } else if (timeParts.length === 2) {
    // Add seconds if missing
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }
  }
  
  return timeString;
}
