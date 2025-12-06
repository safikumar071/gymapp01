import { isSupabaseEnabled, supabase } from '../api/supabase';
import { MOCK_ATTENDANCE, MOCK_MEMBERS } from '../utils/mockData';
import { Attendance, Member } from '../types';

type AttendanceResult = { data: Attendance[] | null; error?: any };

export async function fetchAttendance(
  gymId: string,
  limit = 50,
  offset = 0
): Promise<AttendanceResult> {
  if (!isSupabaseEnabled || !supabase) {
    return { data: MOCK_ATTENDANCE.slice(offset, offset + limit) };
  }

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('gym_id', gymId)
      .order('checkin_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchMemberAttendance(
  memberId: string
): Promise<AttendanceResult> {
  if (!isSupabaseEnabled || !supabase) {
    const filtered = MOCK_ATTENDANCE.filter((a) => a.member_id === memberId);
    return { data: filtered };
  }

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_id', memberId)
      .order('checkin_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createAttendance(
  attendance: Omit<Attendance, 'id'>
): Promise<{ data: Attendance | null; error?: any }> {
  if (!isSupabaseEnabled || !supabase) {
    const newAttendance: Attendance = {
      ...attendance,
      id: `a_${Date.now()}`,
    };
    return { data: newAttendance };
  }

  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendance)
      .select()
      .maybeSingle();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getAttendanceStats(
  gymId: string,
  startDate: string,
  endDate: string
): Promise<{ total: number; unique_members: number }> {
  if (!isSupabaseEnabled || !supabase) {
    const filtered = MOCK_ATTENDANCE.filter(
      (a) => a.checkin_at >= startDate && a.checkin_at <= endDate
    );
    const unique = new Set(filtered.map((a) => a.member_id)).size;
    return { total: filtered.length, unique_members: unique };
  }

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('member_id')
      .eq('gym_id', gymId)
      .gte('checkin_at', startDate)
      .lte('checkin_at', endDate);

    if (error || !data) {
      return { total: 0, unique_members: 0 };
    }

    const unique = new Set(data.map((a) => a.member_id)).size;
    return { total: data.length, unique_members: unique };
  } catch (error) {
    return { total: 0, unique_members: 0 };
  }
}

export async function getAttendanceWithMemberNames(
  gymId: string,
  limit = 50,
  offset = 0
): Promise<
  {
    data: (Attendance & { member_name: string })[] | null;
    error?: any;
  }
> {
  const { data: attendance, error } = await fetchAttendance(gymId, limit, offset);

  if (!attendance) {
    return { data: null, error };
  }

  const memberMap = new Map(MOCK_MEMBERS.map((m) => [m.id, m.name]));

  const enriched = attendance.map((a) => ({
    ...a,
    member_name: memberMap.get(a.member_id) || 'Unknown Member',
  }));

  return { data: enriched };
}
