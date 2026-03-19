'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Shield, Sparkles } from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import useStore from '@/store/useStore';
import type { IdentityType, CommunicationPreference, ComfortPreference, AvailabilityVibe } from '@/types';
import { COMMUNICATION_LABELS, COMMUNICATION_ICONS, COMFORT_LABELS, INTEREST_OPTIONS, WOULD_YOU_RATHER_QUESTIONS } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STEPS = ['Preferred name', 'Identity', 'Communication', 'Interests', 'Location', 'Short responses', 'Would you rather', 'Safety'];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentUser, setCurrentUser, loadFromStorage } = useStore();
  const [step, setStep] = useState(0);

  // Form state
  const [identity, setIdentity] = useState<IdentityType | null>(null);
  const [commPrefs, setCommPrefs] = useState<CommunicationPreference[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [addressLat, setAddressLat] = useState<number | null>(null);
  const [addressLng, setAddressLng] = useState<number | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const [school, setSchool] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<any[]>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [isLoadingSchoolSuggestions, setIsLoadingSchoolSuggestions] = useState(false);
  const schoolDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [radius, setRadius] = useState(15);
  const [showToAllies, setShowToAllies] = useState(false);
  const [allowGroupInvites, setAllowGroupInvites] = useState(false);
  const [showASLLearners, setShowASLLearners] = useState(false);
  const [comfortPrefs, setComfortPrefs] = useState<ComfortPreference[]>([]);
  const [preferredName, setPreferredName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [perfectHangout, setPerfectHangout] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [lookingForFriend, setLookingForFriend] = useState('');
  const [wouldYouRather, setWouldYouRather] = useState<Record<string, 'a' | 'b'>>({});
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  let abortController: AbortController | null = null;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (session?.user?.name && !preferredName) {
      setPreferredName(session.user.name);
    }
  }, [session?.user?.name]);

  // If user already has a complete profile (returning user), skip onboarding and go to discover
  useEffect(() => {
    if (currentUser?.onboardingComplete) {
      router.push('/discover');
    }
  }, [currentUser, router]);

  // DFW metroplex center and search area (50 mile radius)
  const DFW_CENTER = { lat: 32.766, lng: -97.064 };
  const DFW_RADIUS_MILES = 50;

  // Calculate distance between two coordinates in miles
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Nominatim autocomplete for addresses via backend API (avoids CORS issues)
  // Restricted to DFW area
  const fetchAddressSuggestions = async (input: string) => {
    if (!input || input.length < 3) {
      setAddressSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    // Cancel previous request if still pending
    if (abortController) abortController.abort();
    abortController = new AbortController();

    try {
      const response = await fetch(
        `/api/search-address?q=${encodeURIComponent(input)}`,
        { signal: abortController.signal }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAddressSuggestions(data);
      setShowSuggestions(true);
      setIsLoadingSuggestions(false);
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Error fetching address suggestions:', error);
        setAddressSuggestions([]);
        setIsLoadingSuggestions(false);
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (300ms delay)
    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);
  };

  const selectAddress = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    // Check if within 50-mile radius of DFW center
    const distance = calculateDistance(DFW_CENTER.lat, DFW_CENTER.lng, lat, lng);

    if (distance > DFW_RADIUS_MILES) {
      alert(`This location is ${distance.toFixed(1)} miles from the DFW area. Please select a location within ${DFW_RADIUS_MILES} miles of Dallas-Fort Worth.`);
      return;
    }

    setAddress(suggestion.display_name);
    setAddressLat(lat);
    setAddressLng(lng);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchSchoolSuggestions = async (input: string) => {
    if (!input || input.length < 3) {
      setSchoolSuggestions([]);
      setIsLoadingSchoolSuggestions(false);
      return;
    }

    setIsLoadingSchoolSuggestions(true);

    if (schoolDebounceTimerRef.current) {
      clearTimeout(schoolDebounceTimerRef.current);
    }

    schoolDebounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-address?q=${encodeURIComponent(input)}&type=school`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setSchoolSuggestions(data);
        setShowSchoolSuggestions(true);
      } catch (error) {
        console.error('Error fetching school suggestions:', error);
        setSchoolSuggestions([]);
      } finally {
        setIsLoadingSchoolSuggestions(false);
      }
    }, 250);
  };

  const selectSchool = (suggestion: any) => {
    setSchool(suggestion.display_name);
    setSchoolSuggestions([]);
    setShowSchoolSuggestions(false);
  };

  const toggleComm = (pref: CommunicationPreference) => {
    setCommPrefs((p) =>
      p.includes(pref) ? p.filter((x) => x !== pref) : [...p, pref]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((p) =>
      p.includes(interest) ? p.filter((x) => x !== interest) : [...p, interest]
    );
  };

  const toggleComfort = (pref: ComfortPreference) => {
    setComfortPrefs((p) =>
      p.includes(pref) ? p.filter((x) => x !== pref) : [...p, pref]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return preferredName.trim().length > 0 && ageRange.length > 0;
      case 1: return identity !== null;
      case 2: return commPrefs.length > 0 && comfortPrefs.length > 0;
      case 3: return interests.length >= 3;
      case 4: return address.length > 0;
      case 5: return true;
      case 6: return true;
      case 7: return true;
      default: return false;
    }
  };

  const handleComplete = () => {
    const userName = preferredName.trim() || session?.user?.name || 'User';
    const userEmail = session?.user?.email || 'user@example.com';

    const profile = {
      id: currentUser?.id || uuidv4(),
      name: userName,
      email: userEmail,
      avatar: session?.user?.image || '',
      photos: [],
      identity: identity!,
      communicationPreferences: commPrefs,
      comfortPreferences: comfortPrefs,
      interests,
      bio: {
        perfectHangout: perfectHangout.trim() || undefined,
        communicationStyle: communicationStyle.trim() || undefined,
        lookingForFriend: lookingForFriend.trim() || undefined,
      },
      wouldYouRatherAnswers: Object.keys(wouldYouRather).length > 0 ? wouldYouRather : undefined,
      location: {
        city: address,
        school: school || undefined,
        radiusMiles: radius,
        lat: addressLat ?? undefined,
        lng: addressLng ?? undefined,
      },
      availability: [] as AvailabilityVibe[],
      safetySettings: {
        showToHearingAllies: showToAllies,
        allowGroupInvites,
        showASLLearners,
      },
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
      ...(ageRange ? { ageRange } : {}),
    };

    setCurrentUser(profile);
    router.push('/discover');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferred name & age</h2>
              <p className="text-gray-500 text-sm">What should we call you? This is how you&apos;ll appear to others.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Your name</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g., Alex, Maya, Jordan"
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Age range</label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white"
              >
                <option value="">Select your age range</option>
                <option value="13-15">13–15</option>
                <option value="16-18">16–18</option>
                <option value="19-21">19–21</option>
                <option value="22+">22+</option>
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Who are you?</h2>
              <p className="text-gray-500 text-sm">This helps us find the right community for you</p>
            </div>
            {([
              { value: 'deaf' as IdentityType, label: 'Deaf', icon: '🤟', desc: 'I identify as Deaf' },
              { value: 'hoh' as IdentityType, label: 'Hard of Hearing', icon: '👂', desc: 'I have some hearing loss' },
              { value: 'hearing_ally' as IdentityType, label: 'Hearing Ally', icon: '🤝', desc: 'I support the Deaf community' },
            ]).map((option) => (
              <button
                key={option.value}
                onClick={() => setIdentity(option.value)}
                className={`w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-all ${identity === option.value
                  ? 'bg-purple-500 text-white shadow-lg scale-[1.02]'
                  : 'bg-white border-2 border-gray-100 hover:border-purple-200 text-gray-800'
                  }`}
              >
                <span className="text-3xl">{option.icon}</span>
                <div>
                  <div className="font-bold text-lg">{option.label}</div>
                  <div className={`text-sm ${identity === option.value ? 'text-purple-100' : 'text-gray-500'}`}>
                    {option.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How do you communicate?</h2>
              <p className="text-gray-500 text-sm">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(COMMUNICATION_LABELS) as CommunicationPreference[]).map((pref) => (
                <button
                  type="button"
                  key={pref}
                  onClick={() => toggleComm(pref)}
                  className={`p-4 rounded-2xl text-center transition-all cursor-pointer ${commPrefs.includes(pref)
                    ? 'bg-purple-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-white border-2 border-gray-100 hover:border-purple-200 text-gray-800'
                    }`}
                >
                  <span className="text-2xl block mb-1">{COMMUNICATION_ICONS[pref]}</span>
                  <span className="text-sm font-semibold">{COMMUNICATION_LABELS[pref]}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Comfort preferences</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(COMFORT_LABELS) as ComfortPreference[]).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => toggleComfort(pref)}
                    className={`p-3 rounded-xl text-xs font-medium transition-all ${comfortPrefs.includes(pref)
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                      }`}
                  >
                    {COMFORT_LABELS[pref]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your interests</h2>
              <p className="text-gray-500 text-sm">Pick at least 3 to help find your people</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${interests.includes(interest)
                    ? 'bg-purple-500 text-white shadow-md scale-[1.02]'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'
                    }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <MapPin className="mx-auto mb-3 text-purple-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your location</h2>
              <p className="text-gray-500 text-sm">Your address stays hidden — others only see distance</p>
            </div>
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Address</label>
              <input
                type="text"
                ref={addressInputRef}
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => address && setShowSuggestions(true)}
                placeholder="Start typing an address (e.g., 1600 Amphitheatre Pkwy, Mountain View, CA)"
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white"
                autoComplete="off"
              />
              {isLoadingSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-100 rounded-2xl shadow-lg z-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Loading suggestions...</p>
                </div>
              )}
              {showSuggestions && addressSuggestions.length > 0 && !isLoadingSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-100 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {addressSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectAddress(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-800">{suggestion.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 block mb-2">School (optional)</label>
              <input
                type="text"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  fetchSchoolSuggestions(e.target.value);
                }}
                onFocus={() => school && setShowSchoolSuggestions(true)}
                placeholder="e.g., Lincoln High School"
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white"
                autoComplete="off"
              />
              {isLoadingSchoolSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-100 rounded-2xl shadow-lg z-50 p-3 text-center">
                  <p className="text-sm text-gray-500">Loading school suggestions...</p>
                </div>
              )}
              {showSchoolSuggestions && schoolSuggestions.length > 0 && !isLoadingSchoolSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-100 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {schoolSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSchool(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-800">{suggestion.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Distance radius: {radius} miles
              </label>
              <p className="text-xs text-gray-500 mb-2">
                We use this radius to prioritize matches nearby while keeping your exact address private.
              </p>
              <input
                type="range"
                min="5"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 mi</span>
                <span>50 mi</span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">A little about you</h2>
              <p className="text-gray-500 text-sm">Optional — you can always add or edit these in your profile later</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">A perfect hangout is...</label>
              <textarea
                value={perfectHangout}
                onChange={(e) => setPerfectHangout(e.target.value)}
                placeholder="e.g., a quiet coffee shop with good pastries"
                rows={2}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">My communication style is...</label>
              <textarea
                value={communicationStyle}
                onChange={(e) => setCommunicationStyle(e.target.value)}
                placeholder="e.g., fluent ASL, love visual conversations"
                rows={2}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">I&apos;d love a friend to...</label>
              <textarea
                value={lookingForFriend}
                onChange={(e) => setLookingForFriend(e.target.value)}
                placeholder="e.g., explore art galleries and go on walks with"
                rows={2}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white resize-none"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Would you rather?</h2>
              <p className="text-gray-500 text-sm">Quick choices — we use these to find better matches. All optional.</p>
            </div>
            <div className="space-y-4">
              {WOULD_YOU_RATHER_QUESTIONS.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white border-2 border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 mb-3">{q.question}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWouldYouRather((prev) => {
                        if (prev[q.id] === 'a') {
                          const next = { ...prev };
                          delete next[q.id];
                          return next;
                        }
                        return { ...prev, [q.id]: 'a' };
                      })}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${wouldYouRather[q.id] === 'a'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:border-purple-200 border-2 border-transparent'
                        }`}
                    >
                      {q.optionA}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldYouRather((prev) => {
                        if (prev[q.id] === 'b') {
                          const next = { ...prev };
                          delete next[q.id];
                          return next;
                        }
                        return { ...prev, [q.id]: 'b' };
                      })}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${wouldYouRather[q.id] === 'b'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:border-purple-200 border-2 border-transparent'
                        }`}
                    >
                      {q.optionB}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <Shield className="mx-auto mb-3 text-purple-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety & boundaries</h2>
              <p className="text-gray-500 text-sm">You can change these anytime in settings</p>
              <button
                type="button"
                onClick={() => {
                  setShowToAllies(true);
                  setAllowGroupInvites(true);
                  setShowASLLearners(true);
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-purple-100 text-purple-700 text-xs font-semibold"
              >
                Select all
              </button>
            </div>
            {[
              {
                label: 'Show me to Hearing Allies',
                desc: 'Allow hearing allies to see your profile',
                value: showToAllies,
                onChange: setShowToAllies,
              },
              {
                label: 'Allow group invites',
                desc: 'Let others invite you to groups',
                value: allowGroupInvites,
                onChange: setAllowGroupInvites,
              },
              {
                label: 'Show ASL learners',
                desc: 'Include people who are learning ASL',
                value: showASLLearners,
                onChange: setShowASLLearners,
              },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{setting.label}</div>
                  <div className="text-xs text-gray-500">{setting.desc}</div>
                </div>
                <button
                  onClick={() => setting.onChange(!setting.value)}
                  className={`w-12 h-6 rounded-full transition-all relative ${setting.value ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        );
    }
    return null;
  };

  return (
    <MobileFrame>
      <div className="flex flex-col min-h-full bg-gray-50">
        {/* Header */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="text-purple-500" size={24} />
            <span className="text-sm font-semibold text-gray-500">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 py-4 pb-8 bg-gray-50/95 backdrop-blur-sm" style={{ borderBottomLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}>
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gray-100 text-gray-700 font-semibold flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}
            <button
              onClick={step === STEPS.length - 1 ? handleComplete : () => setStep(step + 1)}
              disabled={!canProceed()}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold flex items-center justify-center gap-1 transition-all ${canProceed()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {step === STEPS.length - 1 ? 'Complete' : 'Next'}
              {step < STEPS.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
