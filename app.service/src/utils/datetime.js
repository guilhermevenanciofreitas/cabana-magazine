import dayjs from 'dayjs';

export class DateTime {

  static from(date) {
    date = dayjs(date);
    return date.add(date.utcOffset() * -1, 'minute');
  }

}