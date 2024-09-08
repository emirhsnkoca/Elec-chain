use anchor_lang::prelude::*;

declare_id!("G3t5r7YdHwAf9DBjF1oqqNt4s76S31mxkHtsSodSKuxe"); 

#[program]
pub mod election_program {
    use super::*;

    // Oy verme fonksiyonu
    pub fn vote(ctx: Context<Vote>, candidate: String) -> ProgramResult {
        let election_state = &mut ctx.accounts.election_state;

        // Oy kullanmış mı kontrol et
        require!(
            !election_state.voters.contains(&ctx.accounts.voter.key()),
            ElectionError::AlreadyVoted
        );

        // Oy ver ve blockchain'e kaydet
        match candidate.as_str() {
            "Aday 1" => election_state.candidate1_votes += 1,
            "Aday 2" => election_state.candidate2_votes += 1,
            "Aday 3" => election_state.candidate3_votes += 1,
            _ => return Err(ProgramError::InvalidArgument),
        }

        // Voter'ı kaydet
        election_state.voters.push(ctx.accounts.voter.key());

        Ok(())
    }

    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

// Seçim durumu (votes)
#[account]
pub struct ElectionState {
    pub candidate1_votes: u64,
    pub candidate2_votes: u64,
    pub candidate3_votes: u64,
    pub voters: Vec<Pubkey>, // Oy kullanmış cüzdan adreslerini tutuyoruz
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub election_state: Account<'info, ElectionState>,
    #[signer]
    pub voter: AccountInfo<'info>,
}

// Hata yönetimi
#[error]
pub enum ElectionError {
    #[msg("Bu cüzdan zaten oy kullanmış.")]
    AlreadyVoted,
}
