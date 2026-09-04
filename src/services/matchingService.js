const toSet = (values = []) => new Set(values)

export function matchProfileToOpportunity(profile, opportunity) {
  const profileSkills = toSet(profile?.skills)
  const requiredSkills = opportunity.requiredSkills || opportunity.skills || []
  const matchedSkills = requiredSkills.filter((skill) => profileSkills.has(skill))
  const missingSkills = requiredSkills.filter((skill) => !profileSkills.has(skill))
  const skillScore = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0
  const interestScore = opportunity.interest && profile?.interests?.includes(opportunity.interest) ? 1 : .7
  const educationRequirements = opportunity.educationRequirements || []
  const educationScore = educationRequirements.length === 0 || educationRequirements.includes(profile?.education) || (profile?.education === 'BCA' && educationRequirements.includes('Bachelor degree')) ? 1 : .65
  const yearRequirements = opportunity.yearRequirements || []
  const yearScore = yearRequirements.length === 0 || yearRequirements.includes(profile?.year) ? 1 : .65
  const experienceScore = opportunity.fresherFriendly || !opportunity.experienceRange || profile?.year === 'Graduate' ? 1 : profile?.year === 'Final Year' ? .85 : .65
  const marksScore = opportunity.minimumPercentage && Number(profile?.percentage || 0) < opportunity.minimumPercentage ? .55 : 1
  const matchPercentage = opportunity.type === 'College'
    ? Math.round((educationScore * .45 + marksScore * .35 + yearScore * .2) * 100)
    : Math.round((skillScore * .5 + interestScore * .2 + educationScore * .15 + experienceScore * .15) * 100)
  const eligibilityStatus = opportunity.type === 'College'
    ? educationScore === 1 && marksScore === 1 ? 'eligible' : matchPercentage >= 60 ? 'almost' : 'explore'
    : educationScore === 1 && experienceScore === 1 && skillScore >= .75 ? 'eligible' : matchPercentage >= 60 ? 'almost' : 'explore'
  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    eligibilityStatus
  }
}

export function matchCareerToProfile(profile, career) {
  return matchProfileToOpportunity(profile, { ...career, interest: career.interest })
}
